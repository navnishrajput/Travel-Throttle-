package com.travelthrottle.service.impl;

import com.travelthrottle.dto.request.RideRequestDto;
import com.travelthrottle.dto.response.RideRequestResponse;
import com.travelthrottle.dto.response.RideSummaryResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import com.travelthrottle.exception.BadRequestException;
import com.travelthrottle.exception.ResourceNotFoundException;
import com.travelthrottle.exception.UnauthorizedException;
import com.travelthrottle.model.Notification;
import com.travelthrottle.model.Ride;
import com.travelthrottle.model.RideRequest;
import com.travelthrottle.model.User;
import com.travelthrottle.model.enums.NotificationType;
import com.travelthrottle.model.enums.RequestStatus;
import com.travelthrottle.repository.NotificationRepository;
import com.travelthrottle.repository.RideRepository;
import com.travelthrottle.repository.RideRequestRepository;
import com.travelthrottle.repository.UserRepository;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.ChatService;
import com.travelthrottle.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {

    private static final Logger logger = LoggerFactory.getLogger(RequestServiceImpl.class);

    private final RideRequestRepository requestRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new UnauthorizedException("User not authenticated");
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @Override
    @Transactional
    public RideRequestResponse createRequest(RideRequestDto requestDto) {
        logger.info("=== CREATE REQUEST START ===");
        logger.info("RideId: {}, Seats: {}", requestDto.getRideId(), requestDto.getSeatsRequested());

        String userId = getCurrentUserId();
        logger.info("Requester userId: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        logger.info("Requester: {} ({})", user.getName(), user.getEmail());

        Ride ride = rideRepository.findById(requestDto.getRideId())
                .orElseThrow(() -> ResourceNotFoundException.ride(requestDto.getRideId()));

        logger.info("Ride: {} -> {}, Owner: {}, Status: {}, Available Seats: {}, Total Seats: {}",
                ride.getSource(), ride.getDestination(),
                ride.getOwner() != null ? ride.getOwner().getName() : "null",
                ride.getStatus(), ride.getAvailableSeats(), ride.getTotalSeats());

        // Check if user is the owner
        if (ride.getOwner() != null && ride.getOwner().getId().equals(userId)) {
            logger.warn("User attempted to request their own ride");
            throw new BadRequestException("You cannot request to join your own ride");
        }

        // Check if ride can be joined
        if (ride.getStatus() != com.travelthrottle.model.enums.RideStatus.UPCOMING) {
            throw new BadRequestException("This ride is not available for joining");
        }

        if (ride.getAvailableSeats() == null || ride.getAvailableSeats() <= 0) {
            throw new BadRequestException("This ride is full");
        }

        // Check if user already has a request
        if (requestRepository.existsByRideIdAndUserId(ride.getId(), user.getId())) {
            logger.warn("User already has a request for this ride");
            throw new BadRequestException("You have already requested to join this ride");
        }

        // Check if requested seats are available
        int seatsRequested = requestDto.getSeatsRequested() != null ? requestDto.getSeatsRequested() : 1;
        if (seatsRequested > ride.getAvailableSeats()) {
            throw new BadRequestException("Only " + ride.getAvailableSeats() + " seats available");
        }

        // Create request
        RideRequest request = new RideRequest();
        request.setRide(ride);
        request.setUser(user);
        request.setMessage(requestDto.getMessage());
        request.setSeatsRequested(seatsRequested);
        request.setStatus(RequestStatus.PENDING);

        logger.info("Saving request to database...");
        RideRequest savedRequest = requestRepository.save(request);
        logger.info("Request saved with ID: {}", savedRequest.getId());

        // Create notification for ride owner
        sendRideRequestNotification(ride, user);

        logger.info("=== CREATE REQUEST END ===");
        return mapToResponse(savedRequest);
    }

    @Override
    @Transactional
    public RideRequestResponse approveRequest(String requestId) {
        logger.info("=== APPROVE REQUEST START ===");
        logger.info("RequestId: {}", requestId);

        RideRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> ResourceNotFoundException.request(requestId));

        String userId = getCurrentUserId();
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        // Check if user is the ride owner or admin
        if (!request.getRide().getOwner().getId().equals(userId) && !isAdmin()) {
            logger.warn("User {} attempted to approve request {} without permission", userId, requestId);
            throw new UnauthorizedException("Only the ride owner can approve requests");
        }

        // Check if request is pending
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be approved");
        }

        // CRITICAL FIX: Get FRESH ride data from database
        Ride ride = rideRepository.findById(request.getRide().getId())
                .orElseThrow(() -> ResourceNotFoundException.ride(request.getRide().getId()));

        int seatsRequested = request.getSeatsRequested() != null ? request.getSeatsRequested() : 1;

        logger.info("BEFORE APPROVAL - Total Seats: {}, Available Seats: {}, Requested: {}",
                ride.getTotalSeats(), ride.getAvailableSeats(), seatsRequested);

        // Check if enough seats are available
        if (seatsRequested > ride.getAvailableSeats()) {
            String errorMsg = String.format("Cannot approve: Only %d seat(s) available, but request is for %d seat(s)",
                    ride.getAvailableSeats(), seatsRequested);
            logger.warn(errorMsg);
            throw new BadRequestException(errorMsg);
        }

        // Approve request
        request.setStatus(RequestStatus.APPROVED);
        request.setRespondedAt(LocalDateTime.now());

        // CRITICAL FIX: Decrement available seats by EXACTLY seatsRequested
        int newAvailableSeats = ride.getAvailableSeats() - seatsRequested;
        ride.setAvailableSeats(newAvailableSeats);
        rideRepository.saveAndFlush(ride);

        logger.info("AFTER APPROVAL - New Available Seats: {}", newAvailableSeats);

        RideRequest savedRequest = requestRepository.save(request);
        logger.info("Request approved: {}", savedRequest.getId());

        // Send approval notification to requester
        sendRequestApprovedNotification(request);

        // Send system message to ride chat
        try {
            chatService.sendUserJoinedMessage(ride.getId(), request.getUser());
        } catch (Exception e) {
            logger.warn("Failed to send user joined message: {}", e.getMessage());
        }

        logger.info("=== APPROVE REQUEST END ===");
        return mapToResponse(savedRequest);
    }

    @Override
    @Transactional
    public RideRequestResponse rejectRequest(String requestId) {
        logger.info("=== REJECT REQUEST START ===");
        logger.info("RequestId: {}", requestId);

        RideRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> ResourceNotFoundException.request(requestId));

        String userId = getCurrentUserId();

        // Check if user is the ride owner or admin
        if (!request.getRide().getOwner().getId().equals(userId) && !isAdmin()) {
            logger.warn("User {} attempted to reject request {} without permission", userId, requestId);
            throw new UnauthorizedException("Only the ride owner can reject requests");
        }

        // Check if request is pending
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be rejected");
        }

        // Reject request
        request.setStatus(RequestStatus.REJECTED);
        request.setRespondedAt(LocalDateTime.now());

        RideRequest savedRequest = requestRepository.save(request);
        logger.info("Request rejected: {}", savedRequest.getId());

        // Send rejection notification to requester
        sendRequestRejectedNotification(request);

        logger.info("=== REJECT REQUEST END ===");
        return mapToResponse(savedRequest);
    }

    @Override
    @Transactional
    public void cancelRequest(String requestId) {
        logger.info("Cancelling request: {}", requestId);

        RideRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> ResourceNotFoundException.request(requestId));

        String userId = getCurrentUserId();

        // Check if user is the requester or admin
        if (!request.getUser().getId().equals(userId) && !isAdmin()) {
            throw new UnauthorizedException("You can only cancel your own requests");
        }

        // If request was approved, restore the seats
        if (request.getStatus() == RequestStatus.APPROVED) {
            Ride ride = rideRepository.findById(request.getRide().getId())
                    .orElseThrow(() -> ResourceNotFoundException.ride(request.getRide().getId()));
            int seatsToRestore = request.getSeatsRequested() != null ? request.getSeatsRequested() : 1;
            int newAvailableSeats = ride.getAvailableSeats() + seatsToRestore;
            ride.setAvailableSeats(newAvailableSeats);
            rideRepository.saveAndFlush(ride);
            logger.info("Restored {} seats to ride {}. New available: {}", seatsToRestore, ride.getId(), newAvailableSeats);

            // Send system message to ride chat
            try {
                chatService.sendUserLeftMessage(ride.getId(), request.getUser());
                logger.info("User left system message sent to ride chat");
            } catch (Exception e) {
                logger.warn("Failed to send user left message: {}", e.getMessage());
            }
        }

        request.setStatus(RequestStatus.CANCELLED);
        requestRepository.save(request);
        logger.info("Request cancelled: {}", requestId);
    }

    @Override
    public List<RideRequestResponse> getRequestsByRide(String rideId) {
        logger.info("Fetching requests for ride: {}", rideId);

        // Verify ride exists
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> ResourceNotFoundException.ride(rideId));

        String userId = getCurrentUserId();

        // Check if user is owner OR an approved participant
        boolean isOwner = ride.getOwner().getId().equals(userId);
        boolean isAdminUser = isAdmin();

        boolean isApprovedParticipant = false;
        if (!isOwner && !isAdminUser) {
            List<RideRequest> userRequests = requestRepository.findByRideId(rideId);
            isApprovedParticipant = userRequests.stream()
                    .anyMatch(req -> req.getUser() != null &&
                            req.getUser().getId().equals(userId) &&
                            req.getStatus() == RequestStatus.APPROVED);
        }

        // CRITICAL FIX: Allow owner, admin, OR approved participants to view requests
        if (!isOwner && !isAdminUser && !isApprovedParticipant) {
            logger.warn("User {} attempted to view requests for ride {} without permission", userId, rideId);
            throw new UnauthorizedException("You must be a participant to view ride requests");
        }

        logger.info("User {} has permission to view requests (owner={}, admin={}, participant={})",
                userId, isOwner, isAdminUser, isApprovedParticipant);

        List<RideRequest> requests = requestRepository.findByRideId(rideId);
        logger.info("Found {} requests for ride {}", requests.size(), rideId);

        return requests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RideRequestResponse> getUserRequests() {
        String userId = getCurrentUserId();
        logger.info("Fetching requests for user: {}", userId);

        List<RideRequest> requests = requestRepository.findByUserId(userId);
        logger.info("Found {} requests for user", requests.size());

        return requests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ==================== NOTIFICATION METHODS ====================

    private void sendRideRequestNotification(Ride ride, User requester) {
        try {
            User owner = ride.getOwner();
            if (owner == null) {
                logger.warn("Ride owner is null, cannot create notification");
                return;
            }

            String message = String.format("%s wants to join your ride from %s to %s",
                    requester.getName(), ride.getSource(), ride.getDestination());

            Notification notification = Notification.builder()
                    .user(owner)
                    .type(NotificationType.RIDE_REQUEST)
                    .title("New Join Request")
                    .message(message)
                    .referenceId(ride.getId())
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            logger.info("Ride request notification saved with ID: {} for owner: {}",
                    savedNotification.getId(), owner.getEmail());

            try {
                messagingTemplate.convertAndSendToUser(
                        owner.getId(),
                        "/queue/notifications",
                        savedNotification
                );
                logger.info("WebSocket notification sent to owner");
            } catch (Exception e) {
                logger.warn("Failed to send WebSocket notification: {}", e.getMessage());
            }

        } catch (Exception e) {
            logger.error("Failed to send ride request notification: {}", e.getMessage(), e);
        }
    }

    private void sendRequestApprovedNotification(RideRequest request) {
        try {
            User requester = request.getUser();
            Ride ride = request.getRide();

            String message = String.format("Your request to join the ride from %s to %s has been approved!",
                    ride.getSource(), ride.getDestination());

            Notification notification = Notification.builder()
                    .user(requester)
                    .type(NotificationType.RIDE_APPROVED)
                    .title("Request Approved! 🎉")
                    .message(message)
                    .referenceId(ride.getId())
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            logger.info("Approval notification saved with ID: {} for: {}",
                    savedNotification.getId(), requester.getEmail());

            try {
                messagingTemplate.convertAndSendToUser(
                        requester.getId(),
                        "/queue/notifications",
                        savedNotification
                );
                logger.info("WebSocket approval notification sent to requester");
            } catch (Exception e) {
                logger.warn("Failed to send WebSocket notification: {}", e.getMessage());
            }

        } catch (Exception e) {
            logger.error("Failed to send approval notification: {}", e.getMessage(), e);
        }
    }

    private void sendRequestRejectedNotification(RideRequest request) {
        try {
            User requester = request.getUser();
            Ride ride = request.getRide();

            String message = String.format("Your request to join the ride from %s to %s was not accepted.",
                    ride.getSource(), ride.getDestination());

            Notification notification = Notification.builder()
                    .user(requester)
                    .type(NotificationType.RIDE_REJECTED)
                    .title("Request Not Accepted")
                    .message(message)
                    .referenceId(ride.getId())
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            logger.info("Rejection notification saved with ID: {} for: {}",
                    savedNotification.getId(), requester.getEmail());

            try {
                messagingTemplate.convertAndSendToUser(
                        requester.getId(),
                        "/queue/notifications",
                        savedNotification
                );
                logger.info("WebSocket rejection notification sent to requester");
            } catch (Exception e) {
                logger.warn("Failed to send WebSocket notification: {}", e.getMessage());
            }

        } catch (Exception e) {
            logger.error("Failed to send rejection notification: {}", e.getMessage(), e);
        }
    }

    // ==================== MAPPING METHOD ====================

    private RideRequestResponse mapToResponse(RideRequest request) {
        UserSummaryResponse user = UserSummaryResponse.builder()
                .id(request.getUser().getId())
                .name(request.getUser().getName())
                .email(request.getUser().getEmail())
                .avatar(request.getUser().getAvatar())
                .rating(request.getUser().getRating())
                .totalRides(request.getUser().getTotalRides())
                .verified(request.getUser().getVerified())
                .hasBike(request.getUser().getHasBike())
                .initials(request.getUser().getInitials())
                .phone(request.getUser().getPhone())
                .build();

        RideSummaryResponse ride = RideSummaryResponse.builder()
                .id(request.getRide().getId())
                .source(request.getRide().getSource())
                .destination(request.getRide().getDestination())
                .dateTime(request.getRide().getDateTime())
                .costPerPerson(request.getRide().getCostPerPerson())
                .availableSeats(request.getRide().getAvailableSeats())
                .totalSeats(request.getRide().getTotalSeats())
                .status(request.getRide().getStatus())
                .build();

        return RideRequestResponse.builder()
                .id(request.getId())
                .status(request.getStatus())
                .message(request.getMessage())
                .seatsRequested(request.getSeatsRequested())
                .createdAt(request.getCreatedAt())
                .respondedAt(request.getRespondedAt())
                .user(user)
                .ride(ride)
                .isPending(request.getStatus() == RequestStatus.PENDING)
                .isApproved(request.getStatus() == RequestStatus.APPROVED)
                .isRejected(request.getStatus() == RequestStatus.REJECTED)
                .isCancelled(request.getStatus() == RequestStatus.CANCELLED)
                .build();
    }
}