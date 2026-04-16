package com.travelthrottle.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideRequestDto {

    @NotBlank(message = "Ride ID is required")
    private String rideId;

    @Size(max = 500, message = "Message cannot exceed 500 characters")
    private String message;

    @Min(value = 1, message = "At least 1 seat required")
    private Integer seatsRequested = 1;
}