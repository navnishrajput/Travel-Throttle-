package com.travelthrottle.service;

import com.travelthrottle.dto.request.RideRequestDto;
import com.travelthrottle.dto.response.RideRequestResponse;

import java.util.List;

public interface RequestService {

    RideRequestResponse createRequest(RideRequestDto request);

    RideRequestResponse approveRequest(String requestId);

    RideRequestResponse rejectRequest(String requestId);

    void cancelRequest(String requestId);

    List<RideRequestResponse> getRequestsByRide(String rideId);

    List<RideRequestResponse> getUserRequests();
}