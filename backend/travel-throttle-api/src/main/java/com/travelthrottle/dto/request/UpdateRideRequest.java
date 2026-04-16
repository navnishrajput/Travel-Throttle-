package com.travelthrottle.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRideRequest {

    @Size(max = 200, message = "Source cannot exceed 200 characters")
    private String source;

    @Size(max = 200, message = "Destination cannot exceed 200 characters")
    private String destination;

    @Future(message = "Ride date must be in the future")
    private LocalDateTime dateTime;

    @Min(value = 1, message = "At least 1 seat required")
    @Max(value = 4, message = "Maximum 4 seats allowed")
    private Integer availableSeats;

    @DecimalMin(value = "0.0", message = "Cost cannot be negative")
    private Double costPerPerson;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private Boolean allowFemaleOnly;
}