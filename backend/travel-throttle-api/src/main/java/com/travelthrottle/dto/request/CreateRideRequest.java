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
public class CreateRideRequest {

    @NotBlank(message = "Source location is required")
    @Size(max = 200, message = "Source cannot exceed 200 characters")
    private String source;

    @NotBlank(message = "Destination is required")
    @Size(max = 200, message = "Destination cannot exceed 200 characters")
    private String destination;

    @NotNull(message = "Date and time is required")
    @Future(message = "Ride date must be in the future")
    private LocalDateTime dateTime;

    @NotNull(message = "Available seats is required")
    @Min(value = 1, message = "At least 1 seat required")
    @Max(value = 4, message = "Maximum 4 seats allowed")
    private Integer availableSeats;

    @NotNull(message = "Total seats is required")
    @Min(value = 1, message = "At least 1 seat required")
    @Max(value = 4, message = "Maximum 4 seats allowed")
    private Integer totalSeats;

    @NotNull(message = "Cost per person is required")
    @DecimalMin(value = "0.0", message = "Cost cannot be negative")
    private Double costPerPerson;

    private Double distance;
    private String duration;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Bike selection is required")
    private String bikeId;

    private Boolean allowFemaleOnly = false;
}