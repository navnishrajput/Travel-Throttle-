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
public class ReviewResponse {

    private String id;
    private Integer rating;
    private String comment;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Reviewer info
    private UserSummaryResponse reviewer;

    // Reviewed user info
    private UserSummaryResponse reviewed;

    // Ride info
    private RideSummaryResponse ride;

    // Helper
    private String ratingStars;
}