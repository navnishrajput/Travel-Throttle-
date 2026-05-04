package com.travelthrottle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SOSAlertResponse {
    private String id;
    private String userId;
    private String userName;
    private String userPhone;
    private String rideId;
    private Double latitude;
    private Double longitude;
    private String message;
    private Boolean notified;
    private Integer contactsNotified;
    private LocalDateTime createdAt;
    private String locationUrl;
}