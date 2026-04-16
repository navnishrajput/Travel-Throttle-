package com.travelthrottle.service.impl;

import com.travelthrottle.dto.request.MessageRequest;
import com.travelthrottle.dto.response.MessageResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import com.travelthrottle.exception.ResourceNotFoundException;
import com.travelthrottle.exception.UnauthorizedException;
import com.travelthrottle.model.Message;
import com.travelthrottle.model.Notification;
import com.travelthrottle.model.Ride;
import com.travelthrottle.model.User;
import com.travelthrottle.model.enums.MessageType;
import com.travelthrottle.model.enums.NotificationType;
import com.travelthrottle.repository.MessageRepository;
import com.travelthrottle.repository.NotificationRepository;
import com.travelthrottle.repository.RideRepository;
import com.travelthrottle.repository.RideRequestRepository;
import com.travelthrottle.repository.UserRepository;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatServiceImpl.class);

    private final MessageRepository messageRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final RideRequestRepository rideRequestRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new UnauthorizedException("User not authenticated");
    }

    private boolean isParticipant(Ride ride, String userId) {
        if (ride.getOwner() != null && ride.getOwner().getId().equals(userId)) {
            return true;
        }
        return rideRequestRepository.findByRideId(ride.getId()).stream()
                .anyMatch(req -> req.getUser() != null &&
                        req.getUser().getId().equals(userId) &&
                        req.isApproved());
    }

    private Set<User> getParticipants(Ride ride) {
        Set<User> participants = new HashSet<>();
        if (ride.getOwner() != null) {
            participants.add(ride.getOwner());
        }
        rideRequestRepository.findByRideId(ride.getId()).stream()
                .filter(req -> req.isApproved() && req.getUser() != null)
                .forEach(req -> participants.add(req.getUser()));
        return participants;
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(MessageRequest request) {
        logger.info("Sending message to ride: {}", request.getRideId());

        String userId = getCurrentUserId();
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> ResourceNotFoundException.ride(request.getRideId()));

        if (!isParticipant(ride, userId)) {
            throw new UnauthorizedException("You are not a participant in this ride");
        }

        MessageType messageType = MessageType.TEXT;
        if (request.getAttachmentUrl() != null && !request.getAttachmentUrl().isEmpty()) {
            messageType = MessageType.IMAGE;
        } else if (request.getContent() != null && request.getContent().startsWith("📍")) {
            messageType = MessageType.LOCATION;
        }

        Message message = Message.builder()
                .content(request.getContent())
                .type(messageType)
                .attachmentUrl(request.getAttachmentUrl())
                .ride(ride)
                .sender(sender)
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        logger.info("Message saved with ID: {}", savedMessage.getId());

        MessageResponse response = mapToResponse(savedMessage, userId);

        try {
            messagingTemplate.convertAndSend("/topic/ride/" + ride.getId(), response);
        } catch (Exception e) {
            logger.warn("WebSocket send failed: {}", e.getMessage());
        }

        sendMessageNotifications(ride, sender);

        return response;
    }

    private void sendMessageNotifications(Ride ride, User sender) {
        try {
            Set<User> participants = getParticipants(ride);
            int notificationCount = 0;

            for (User participant : participants) {
                if (participant.getId().equals(sender.getId())) {
                    continue;
                }

                Notification notification = Notification.builder()
                        .user(participant)
                        .type(NotificationType.NEW_MESSAGE)
                        .title("New Message 💬")
                        .message(String.format("%s sent a message in the %s ride group",
                                sender.getName(),
                                ride.getDestination() != null ? ride.getDestination() : "group"))
                        .referenceId(ride.getId())
                        .isRead(false)
                        .build();

                notificationRepository.save(notification);
                notificationCount++;
            }

            if (notificationCount > 0) {
                logger.info("Sent {} message notifications", notificationCount);
            }
        } catch (Exception e) {
            logger.error("Failed to send message notifications: {}", e.getMessage(), e);
        }
    }

    @Override
    public List<MessageResponse> getRideMessages(String rideId) {
        String userId = getCurrentUserId();
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> ResourceNotFoundException.ride(rideId));

        if (!isParticipant(ride, userId)) {
            throw new UnauthorizedException("You are not a participant in this ride");
        }

        List<Message> messages = messageRepository.findByRideIdOrderByTimestampAsc(rideId);
        logger.info("Found {} messages for ride {}", messages.size(), rideId);

        return messages.stream()
                .map(msg -> mapToResponse(msg, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageResponse sendSystemMessage(String rideId, String content) {
        logger.info("Sending system message to ride: {}", rideId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> ResourceNotFoundException.ride(rideId));

        Message message = Message.builder()
                .content(content)
                .type(MessageType.SYSTEM)
                .ride(ride)
                .sender(null)  // System messages have no sender
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        logger.info("System message saved with ID: {}", savedMessage.getId());

        MessageResponse response = mapToResponse(savedMessage, null);

        try {
            messagingTemplate.convertAndSend("/topic/ride/" + rideId, response);
        } catch (Exception e) {
            logger.warn("WebSocket send failed: {}", e.getMessage());
        }

        return response;
    }

    @Override
    @Transactional
    public void sendUserJoinedMessage(String rideId, User user) {
        String content = String.format("👋 %s joined the ride", user.getName());
        sendSystemMessage(rideId, content);
    }

    @Override
    @Transactional
    public void sendUserLeftMessage(String rideId, User user) {
        String content = String.format("👋 %s left the ride", user.getName());
        sendSystemMessage(rideId, content);
    }

    @Override
    @Transactional
    public void sendRideStatusMessage(String rideId, String status) {
        String content = String.format("ℹ️ Ride status changed to: %s", status);
        sendSystemMessage(rideId, content);
    }

    private MessageResponse mapToResponse(Message message, String currentUserId) {
        UserSummaryResponse sender = null;
        if (message.getSender() != null) {
            sender = UserSummaryResponse.builder()
                    .id(message.getSender().getId())
                    .name(message.getSender().getName())
                    .avatar(message.getSender().getAvatar())
                    .build();
        }

        boolean isOwn = currentUserId != null &&
                message.getSender() != null &&
                message.getSender().getId().equals(currentUserId);

        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .type(message.getType())
                .isRead(message.getIsRead())
                .attachmentUrl(message.getAttachmentUrl())
                .timestamp(message.getTimestamp())
                .sender(sender)
                .rideId(message.getRide().getId())
                .isOwn(isOwn)
                .isSystemMessage(message.getType() == MessageType.SYSTEM)
                .build();
    }
}