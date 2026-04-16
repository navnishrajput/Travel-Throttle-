package com.travelthrottle.service.impl;

import com.travelthrottle.dto.request.ReviewRequest;
import com.travelthrottle.dto.response.ReviewResponse;
import com.travelthrottle.dto.response.RideSummaryResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import com.travelthrottle.exception.BadRequestException;
import com.travelthrottle.exception.DuplicateResourceException;
import com.travelthrottle.exception.ResourceNotFoundException;
import com.travelthrottle.exception.UnauthorizedException;
import com.travelthrottle.model.Review;
import com.travelthrottle.model.Ride;
import com.travelthrottle.model.User;
import com.travelthrottle.model.enums.RideStatus;
import com.travelthrottle.repository.ReviewRepository;
import com.travelthrottle.repository.RideRepository;
import com.travelthrottle.repository.UserRepository;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private static final Logger logger = LoggerFactory.getLogger(ReviewServiceImpl.class);

    private final ReviewRepository reviewRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new UnauthorizedException("User not authenticated");
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        logger.info("Creating review for ride: {}", request.getRideId());

        String userId = getCurrentUserId();
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> ResourceNotFoundException.ride(request.getRideId()));

        User reviewed = userRepository.findById(request.getReviewedId())
                .orElseThrow(() -> ResourceNotFoundException.user(request.getReviewedId()));

        // Check if ride is completed
        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new BadRequestException("Can only review completed rides");
        }

        // Check if user is participant
        boolean isParticipant = ride.getOwner().getId().equals(reviewer.getId()) ||
                ride.getRequests().stream().anyMatch(req ->
                        req.getUser().getId().equals(reviewer.getId()) && req.isApproved()
                );

        if (!isParticipant) {
            throw new UnauthorizedException("You must be a participant to review this ride");
        }

        // Check if user is reviewing themselves
        if (reviewer.getId().equals(reviewed.getId())) {
            throw new BadRequestException("You cannot review yourself");
        }

        // Check if review already exists
        if (reviewRepository.existsByRideIdAndReviewerId(ride.getId(), reviewer.getId())) {
            throw DuplicateResourceException.reviewAlreadyExists(ride.getId(), reviewer.getId());
        }

        // Create review
        Review review = new Review();
        review.setRide(ride);
        review.setReviewer(reviewer);
        review.setReviewed(reviewed);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);

        Review savedReview = reviewRepository.save(review);
        logger.info("Review created with ID: {}", savedReview.getId());

        // Update user's average rating
        updateUserRating(reviewed.getId());

        return mapToResponse(savedReview);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(String reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ResourceNotFoundException.review(reviewId));

        String userId = getCurrentUserId();
        if (!review.getReviewer().getId().equals(userId)) {
            throw new UnauthorizedException("You can only update your own reviews");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        if (request.getIsPublic() != null) {
            review.setIsPublic(request.getIsPublic());
        }

        Review savedReview = reviewRepository.save(review);
        updateUserRating(review.getReviewed().getId());

        return mapToResponse(savedReview);
    }

    @Override
    @Transactional
    public void deleteReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ResourceNotFoundException.review(reviewId));

        String userId = getCurrentUserId();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!review.getReviewer().getId().equals(userId) && !isAdmin) {
            throw new UnauthorizedException("You don't have permission to delete this review");
        }

        String reviewedId = review.getReviewed().getId();
        reviewRepository.delete(review);
        updateUserRating(reviewedId);
    }

    @Override
    public ReviewResponse getReviewById(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ResourceNotFoundException.review(reviewId));
        return mapToResponse(review);
    }

    @Override
    public List<ReviewResponse> getReviewsByRide(String rideId) {
        return reviewRepository.findByRideId(rideId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getReviewsByUser(String userId) {
        return reviewRepository.findByReviewedIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ReviewResponse> getReviewsByUserPaged(String userId, Pageable pageable) {
        return reviewRepository.findByReviewedIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public List<ReviewResponse> getReviewsGivenByUser(String userId) {
        return reviewRepository.findByReviewerId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getReviewsReceivedByUser(String userId) {
        return reviewRepository.findByReviewedId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageRatingForUser(String userId) {
        Double avg = reviewRepository.getAverageRatingForUser(userId);
        return avg != null ? avg : 0.0;
    }

    @Override
    public Long countReviewsForUser(String userId) {
        return reviewRepository.countByReviewedId(userId);
    }

    @Override
    public boolean hasUserReviewedRide(String rideId, String userId) {
        return reviewRepository.existsByRideIdAndReviewerId(rideId, userId);
    }

    @Override
    public List<ReviewResponse> getRecentReviews(int limit) {
        return reviewRepository.findAll(Pageable.ofSize(limit)).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getTopRatedReviews(int limit) {
        return reviewRepository.findTopRatedReviews(Pageable.ofSize(limit)).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateUserRating(String userId) {
        Double avgRating = reviewRepository.getAverageRatingForUser(userId);
        Long reviewCount = reviewRepository.countByReviewedId(userId);

        userRepository.findById(userId).ifPresent(user -> {
            user.setRating(avgRating != null ? avgRating : 0.0);
            userRepository.save(user);
        });

        logger.info("Updated rating for user {}: {} (from {} reviews)", userId, avgRating, reviewCount);
    }

    private ReviewResponse mapToResponse(Review review) {
        UserSummaryResponse reviewer = UserSummaryResponse.builder()
                .id(review.getReviewer().getId())
                .name(review.getReviewer().getName())
                .avatar(review.getReviewer().getAvatar())
                .rating(review.getReviewer().getRating())
                .build();

        UserSummaryResponse reviewed = UserSummaryResponse.builder()
                .id(review.getReviewed().getId())
                .name(review.getReviewed().getName())
                .avatar(review.getReviewed().getAvatar())
                .rating(review.getReviewed().getRating())
                .build();

        RideSummaryResponse ride = RideSummaryResponse.builder()
                .id(review.getRide().getId())
                .source(review.getRide().getSource())
                .destination(review.getRide().getDestination())
                .dateTime(review.getRide().getDateTime())
                .status(review.getRide().getStatus())
                .build();

        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .isPublic(review.getIsPublic())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .reviewer(reviewer)
                .reviewed(reviewed)
                .ride(ride)
                .ratingStars(getRatingStars(review.getRating()))
                .build();
    }

    private String getRatingStars(Integer rating) {
        if (rating == null) return "☆☆☆☆☆";
        StringBuilder stars = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            stars.append(i <= rating ? "★" : "☆");
        }
        return stars.toString();
    }
}