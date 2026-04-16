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
public class BikeResponse {
    private String id;
    private String model;
    private String registrationNumber;
    private String color;
    private Integer year;
    private String mileage;
    private Integer capacity;
    private String imageUrl;
    private Boolean verified;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserSummaryResponse owner;
    private Long totalRides;
    private Double totalDistance;
    private String displayName;
}