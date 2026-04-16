package com.travelthrottle.dto.response;

import com.travelthrottle.model.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String id;
    private String content;
    private MessageType type;
    private Boolean isRead;
    private String attachmentUrl;
    private LocalDateTime timestamp;
    private UserSummaryResponse sender;
    private String rideId;
    private Boolean isOwn;
    private Boolean isSystemMessage;
}