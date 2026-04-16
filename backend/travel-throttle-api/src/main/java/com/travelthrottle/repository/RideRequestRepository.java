package com.travelthrottle.repository;

import com.travelthrottle.model.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, String> {

    // Native query - 100% reliable
    @Query(value = "SELECT * FROM ride_requests WHERE ride_id = :rideId ORDER BY created_at DESC", nativeQuery = true)
    List<RideRequest> findByRideId(@Param("rideId") String rideId);

    @Query(value = "SELECT * FROM ride_requests WHERE user_id = :userId ORDER BY created_at DESC", nativeQuery = true)
    List<RideRequest> findByUserId(@Param("userId") String userId);

    @Query(value = "SELECT COUNT(*) > 0 FROM ride_requests WHERE ride_id = :rideId AND user_id = :userId", nativeQuery = true)
    boolean existsByRideIdAndUserId(@Param("rideId") String rideId, @Param("userId") String userId);
}