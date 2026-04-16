package com.travelthrottle.dto.response;

import com.travelthrottle.model.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideRequestResponse {
    private String id;
    private RequestStatus status;
    private String message;
    private Integer seatsRequested;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private UserSummaryResponse user;
    private RideSummaryResponse ride;
    private Boolean isPending;
    private Boolean isApproved;
    private Boolean isRejected;
    private Boolean isCancelled;
}