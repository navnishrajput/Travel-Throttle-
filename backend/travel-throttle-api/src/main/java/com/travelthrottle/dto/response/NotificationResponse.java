package com.travelthrottle.dto.response;

import com.travelthrottle.model.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private String referenceId;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String timeAgo;
    private String icon;

    // User info - flattened to avoid lazy loading issues
    private String userId;
    private String userName;
    private String userAvatar;
}