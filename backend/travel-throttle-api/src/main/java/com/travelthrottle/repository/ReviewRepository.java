package com.travelthrottle.repository;

import com.travelthrottle.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findByRideId(String rideId);

    List<Review> findByReviewerId(String reviewerId);

    List<Review> findByReviewedId(String reviewedId);

    List<Review> findByReviewedIdOrderByCreatedAtDesc(String reviewedId);

    Page<Review> findByReviewedIdOrderByCreatedAtDesc(String reviewedId, Pageable pageable);

    boolean existsByRideIdAndReviewerId(String rideId, String reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewed.id = :userId")
    Double getAverageRatingForUser(@Param("userId") String userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewed.id = :userId")
    Long countByReviewedId(@Param("userId") String userId);

    @Query("SELECT r FROM Review r ORDER BY r.rating DESC, r.createdAt DESC")
    List<Review> findTopRatedReviews(Pageable pageable);
}