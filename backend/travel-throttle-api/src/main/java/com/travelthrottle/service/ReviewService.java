package com.travelthrottle.service;

import com.travelthrottle.dto.request.ReviewRequest;
import com.travelthrottle.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(ReviewRequest request);

    ReviewResponse updateReview(String reviewId, ReviewRequest request);

    void deleteReview(String reviewId);

    ReviewResponse getReviewById(String reviewId);

    List<ReviewResponse> getReviewsByRide(String rideId);

    List<ReviewResponse> getReviewsByUser(String userId);

    Page<ReviewResponse> getReviewsByUserPaged(String userId, Pageable pageable);

    List<ReviewResponse> getReviewsGivenByUser(String userId);

    List<ReviewResponse> getReviewsReceivedByUser(String userId);

    Double getAverageRatingForUser(String userId);

    Long countReviewsForUser(String userId);

    boolean hasUserReviewedRide(String rideId, String userId);

    List<ReviewResponse> getRecentReviews(int limit);

    List<ReviewResponse> getTopRatedReviews(int limit);

    void updateUserRating(String userId);
}