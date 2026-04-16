package com.travelthrottle.controller;

import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.NotificationResponse;
import com.travelthrottle.model.Notification;
import com.travelthrottle.repository.NotificationRepository;
import com.travelthrottle.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetailsImpl) {
                return ((UserDetailsImpl) principal).getId();
            }
        }
        logger.error("Could not get current user ID");
        return null;
    }

    private NotificationResponse mapToResponse(Notification notification) {
        String timeAgo = "";
        if (notification.getCreatedAt() != null) {
            long seconds = Duration.between(notification.getCreatedAt(), LocalDateTime.now()).getSeconds();
            if (seconds < 60) timeAgo = "just now";
            else if (seconds < 3600) timeAgo = (seconds / 60) + "m ago";
            else if (seconds < 86400) timeAgo = (seconds / 3600) + "h ago";
            else timeAgo = (seconds / 86400) + "d ago";
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .timeAgo(timeAgo)
                .icon(notification.getType() != null ? notification.getType().getIcon() : "bell")
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .userName(notification.getUser() != null ? notification.getUser().getName() : null)
                .userAvatar(notification.getUser() != null ? notification.getUser().getAvatar() : null)
                .build();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications() {
        logger.info("GET /notifications called");

        try {
            String userId = getCurrentUserId();
            logger.info("Current user ID: {}", userId);

            if (userId == null) {
                return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
            }

            List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            logger.info("Found {} notifications", notifications.size());

            List<NotificationResponse> responses = notifications.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses));

        } catch (Exception e) {
            logger.error("Error fetching notifications: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        try {
            String userId = getCurrentUserId();
            if (userId == null) {
                Map<String, Long> result = new HashMap<>();
                result.put("count", 0L);
                return ResponseEntity.ok(ApiResponse.success(result));
            }

            Long count = notificationRepository.countUnreadNotifications(userId);
            logger.info("Unread count for user {}: {}", userId, count);

            Map<String, Long> result = new HashMap<>();
            result.put("count", count != null ? count : 0L);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            logger.error("Error fetching unread count: {}", e.getMessage(), e);
            Map<String, Long> result = new HashMap<>();
            result.put("count", 0L);
            return ResponseEntity.ok(ApiResponse.success(result));
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String notificationId) {
        try {
            notificationRepository.markAsRead(notificationId);
            logger.info("Marked notification {} as read", notificationId);
            return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
        } catch (Exception e) {
            logger.error("Error marking as read: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        try {
            String userId = getCurrentUserId();
            if (userId != null) {
                notificationRepository.markAllAsRead(userId);
                logger.info("Marked all notifications as read for user {}", userId);
            }
            return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
        } catch (Exception e) {
            logger.error("Error marking all as read: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable String notificationId) {
        try {
            notificationRepository.deleteById(notificationId);
            logger.info("Deleted notification {}", notificationId);
            return ResponseEntity.ok(ApiResponse.success("Deleted", null));
        } catch (Exception e) {
            logger.error("Error deleting: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success("Deleted", null));
        }
    }

    // Method to send real-time notification
    public void sendNotification(String userId, Notification notification) {
        try {
            Notification savedNotification = notificationRepository.save(notification);
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/notifications",
                    mapToResponse(savedNotification)
            );
            logger.info("Real-time notification sent to user {}", userId);
        } catch (Exception e) {
            logger.error("Failed to send real-time notification: {}", e.getMessage());
        }
    }
}