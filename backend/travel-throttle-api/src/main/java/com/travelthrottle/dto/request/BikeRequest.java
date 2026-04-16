package com.travelthrottle.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BikeRequest {

    @NotBlank(message = "Model is required")
    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;

    @NotBlank(message = "Registration number is required")
    @Size(min = 5, max = 20, message = "Registration number must be between 5 and 20 characters")
    private String registrationNumber;

    @NotBlank(message = "Color is required")
    @Size(max = 30, message = "Color cannot exceed 30 characters")
    private String color;

    private Integer year;
    private String mileage;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 4, message = "Capacity cannot exceed 4")
    private Integer capacity = 2;

    private String description;
}