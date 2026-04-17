package com.travelthrottle.service;

import com.travelthrottle.dto.response.RideResponse;

import java.time.LocalDate;
import java.util.List;

public interface PublicRideService {

    List<RideResponse> getAllUpcomingRides();

    List<RideResponse> getUpcomingRides();

    List<RideResponse> searchRides(String source, String destination, LocalDate date,
                                   Double maxPrice, Integer minSeats);

    RideResponse getRideById(String rideId);

    List<RideResponse> filterRides(String source, String destination,
                                   LocalDate fromDate, LocalDate toDate,
                                   Double minPrice, Double maxPrice,
                                   Integer minSeats, Integer maxSeats);
}