package com.travelthrottle.service;

import com.travelthrottle.dto.request.CreateRideRequest;
import com.travelthrottle.dto.request.UpdateRideRequest;
import com.travelthrottle.dto.response.RideResponse;
import com.travelthrottle.dto.response.RideSummaryResponse;
import com.travelthrottle.model.enums.RideStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface RideService {

    RideResponse createRide(CreateRideRequest request);

    RideResponse updateRide(String rideId, UpdateRideRequest request);

    void cancelRide(String rideId);

    void deleteRide(String rideId);

    RideResponse getRideById(String rideId);

    RideSummaryResponse getRideSummary(String rideId);

    Page<RideResponse> getAllRides(Pageable pageable);

    // ADD THIS METHOD
    List<RideResponse> getMyRides();

    Page<RideResponse> searchRides(String source, String destination, LocalDateTime startDate,
                                   LocalDateTime endDate, Double minPrice, Double maxPrice,
                                   Integer minSeats, Pageable pageable);

    List<RideResponse> getUpcomingRides();

    List<RideResponse> getUserCreatedRides(String userId);

    List<RideResponse> getUserJoinedRides(String userId);

    List<RideResponse> getRidesByStatus(RideStatus status);

    void updateRideStatus(String rideId, RideStatus status);

    void decrementAvailableSeats(String rideId);

    void incrementAvailableSeats(String rideId);

    boolean isRideFull(String rideId);

    boolean canUserJoinRide(String rideId, String userId);
}