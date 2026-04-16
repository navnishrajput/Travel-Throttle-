package com.travelthrottle.controller;

import com.travelthrottle.dto.request.RideRequestDto;
import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.RideRequestResponse;
import com.travelthrottle.service.RequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
@Tag(name = "Ride Request", description = "Ride join request endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class RequestController {

    private static final Logger logger = LoggerFactory.getLogger(RequestController.class);
    private final RequestService requestService;

    @PostMapping
    public ResponseEntity<ApiResponse<RideRequestResponse>> createRequest(@Valid @RequestBody RideRequestDto request) {
        logger.info("POST /requests - rideId: {}", request.getRideId());
        try {
            RideRequestResponse response = requestService.createRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Request sent successfully", response));
        } catch (Exception e) {
            logger.error("Error creating request: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<ApiResponse<List<RideRequestResponse>>> getRequestsByRide(@PathVariable String rideId) {
        logger.info("GET /requests/ride/{}", rideId);
        try {
            List<RideRequestResponse> requests = requestService.getRequestsByRide(rideId);
            logger.info("Returning {} requests", requests.size());
            return ResponseEntity.ok(ApiResponse.success(requests));
        } catch (Exception e) {
            logger.error("Error fetching requests: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<RideRequestResponse>>> getMyRequests() {
        try {
            List<RideRequestResponse> response = requestService.getUserRequests();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching my requests: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<RideRequestResponse>> approveRequest(@PathVariable String requestId) {
        try {
            RideRequestResponse response = requestService.approveRequest(requestId);
            return ResponseEntity.ok(ApiResponse.success("Request approved", response));
        } catch (Exception e) {
            logger.error("Error approving request: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<RideRequestResponse>> rejectRequest(@PathVariable String requestId) {
        try {
            RideRequestResponse response = requestService.rejectRequest(requestId);
            return ResponseEntity.ok(ApiResponse.success("Request rejected", response));
        } catch (Exception e) {
            logger.error("Error rejecting request: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }
}