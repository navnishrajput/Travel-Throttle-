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
public class RideSummaryResponse {
    private String id;
    private String source;
    private String destination;
    private LocalDateTime dateTime;
    private Double costPerPerson;
    private Integer availableSeats;
    private Integer totalSeats;
    private Double distance;
    private String duration;
    private RideStatus status;
    private String bikeModel;
    private Boolean isFull;
}