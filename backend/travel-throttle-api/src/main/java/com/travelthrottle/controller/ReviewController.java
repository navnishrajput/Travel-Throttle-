package com.travelthrottle.controller;

import com.travelthrottle.dto.request.ReviewRequest;
import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.ReviewResponse;
import com.travelthrottle.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Review", description = "User review and rating endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Create review", description = "Create a review for a completed ride")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully", response));
    }

    @PutMapping("/{reviewId}")
    @Operation(summary = "Update review", description = "Update an existing review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.updateReview(reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete review", description = "Delete a review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable String reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    @GetMapping("/{reviewId}")
    @Operation(summary = "Get review by ID", description = "Get details of a specific review")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable String reviewId) {
        ReviewResponse response = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/ride/{rideId}")
    @Operation(summary = "Get reviews by ride", description = "Get all reviews for a ride")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByRide(@PathVariable String rideId) {
        List<ReviewResponse> response = reviewService.getReviewsByRide(rideId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get reviews by user", description = "Get all reviews received by a user")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByUser(@PathVariable String userId) {
        List<ReviewResponse> response = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user/{userId}/paged")
    @Operation(summary = "Get reviews by user paged", description = "Get paginated reviews received by a user")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByUserPaged(
            @PathVariable String userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewResponse> response = reviewService.getReviewsByUserPaged(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user/{userId}/given")
    @Operation(summary = "Get reviews given by user", description = "Get all reviews written by a user")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsGivenByUser(@PathVariable String userId) {
        List<ReviewResponse> response = reviewService.getReviewsGivenByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my-reviews")
    @Operation(summary = "Get my reviews", description = "Get all reviews received by current user")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews() {
        String userId = getCurrentUserId();
        List<ReviewResponse> response = reviewService.getReviewsReceivedByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user/{userId}/rating")
    @Operation(summary = "Get user rating", description = "Get average rating for a user")
    public ResponseEntity<ApiResponse<Double>> getAverageRatingForUser(@PathVariable String userId) {
        Double rating = reviewService.getAverageRatingForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(rating));
    }

    @GetMapping("/user/{userId}/count")
    @Operation(summary = "Count user reviews", description = "Get total number of reviews for a user")
    public ResponseEntity<ApiResponse<Long>> countReviewsForUser(@PathVariable String userId) {
        Long count = reviewService.countReviewsForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/ride/{rideId}/has-reviewed")
    @Operation(summary = "Check if reviewed", description = "Check if current user has reviewed a ride")
    public ResponseEntity<ApiResponse<Boolean>> hasUserReviewedRide(@PathVariable String rideId) {
        String userId = getCurrentUserId();
        boolean hasReviewed = reviewService.hasUserReviewedRide(rideId, userId);
        return ResponseEntity.ok(ApiResponse.success(hasReviewed));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent reviews", description = "Get most recent reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getRecentReviews(
            @RequestParam(defaultValue = "10") int limit) {
        List<ReviewResponse> response = reviewService.getRecentReviews(limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated reviews", description = "Get highest rated reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getTopRatedReviews(
            @RequestParam(defaultValue = "10") int limit) {
        List<ReviewResponse> response = reviewService.getTopRatedReviews(limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private String getCurrentUserId() {
        return org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
    }
}