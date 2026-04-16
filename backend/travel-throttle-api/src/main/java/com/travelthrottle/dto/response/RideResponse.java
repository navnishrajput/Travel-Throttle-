package com.travelthrottle.dto.response;

import com.travelthrottle.model.enums.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideResponse {
    private String id;
    private String source;
    private String destination;
    private LocalDateTime dateTime;
    private Integer availableSeats;
    private Integer totalSeats;
    private Double costPerPerson;
    private Double distance;
    private String duration;
    private String description;
    private Boolean allowFemaleOnly;
    private RideStatus status;
    private LocalDateTime createdAt;
    private UserSummaryResponse owner;
    private Boolean isFull;
    private Boolean canJoin;
    private Boolean isOwner;
}