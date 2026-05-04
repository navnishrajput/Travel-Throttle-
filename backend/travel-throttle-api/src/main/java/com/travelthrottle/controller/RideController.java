package com.travelthrottle.controller;

import com.travelthrottle.dto.request.CreateRideRequest;
import com.travelthrottle.dto.request.UpdateRideRequest;
import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.RideResponse;
import com.travelthrottle.model.enums.RideStatus;
import com.travelthrottle.service.RideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/rides")
@RequiredArgsConstructor
@Tag(name = "Ride", description = "Ride management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class RideController {

    private static final Logger logger = LoggerFactory.getLogger(RideController.class);
    private final RideService rideService;

    @PostMapping
    @Operation(summary = "Create ride")
    public ResponseEntity<ApiResponse<RideResponse>> createRide(@Valid @RequestBody CreateRideRequest request) {
        logger.info("Creating ride: {} -> {}", request.getSource(), request.getDestination());
        try {
            RideResponse response = rideService.createRide(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Ride created successfully", response));
        } catch (Exception e) {
            logger.error("Error creating ride: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{rideId}")
    @Operation(summary = "Update ride")
    public ResponseEntity<ApiResponse<RideResponse>> updateRide(
            @PathVariable String rideId,
            @Valid @RequestBody UpdateRideRequest request) {
        try {
            RideResponse response = rideService.updateRide(rideId, request);
            return ResponseEntity.ok(ApiResponse.success("Ride updated successfully", response));
        } catch (Exception e) {
            logger.error("Error updating ride {}: {}", rideId, e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{rideId}")
    @Operation(summary = "Delete ride")
    public ResponseEntity<ApiResponse<Void>> deleteRide(@PathVariable String rideId) {
        logger.info("DELETE /rides/{} called", rideId);
        try {
            rideService.deleteRide(rideId);
            logger.info("Ride {} deleted successfully", rideId);
            return ResponseEntity.ok(ApiResponse.success("Ride deleted successfully", null));
        } catch (Exception e) {
            logger.error("Error deleting ride {}: {}", rideId, e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{rideId}/cancel")
    @Operation(summary = "Cancel ride")
    public ResponseEntity<ApiResponse<Void>> cancelRide(@PathVariable String rideId) {
        try {
            rideService.cancelRide(rideId);
            return ResponseEntity.ok(ApiResponse.success("Ride cancelled successfully", null));
        } catch (Exception e) {
            logger.error("Error cancelling ride {}: {}", rideId, e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{rideId}")
    @Operation(summary = "Get ride by ID")
    public ResponseEntity<ApiResponse<RideResponse>> getRideById(@PathVariable String rideId) {
        try {
            RideResponse response = rideService.getRideById(rideId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching ride {}: {}", rideId, e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Ride not found"));
        }
    }

    @GetMapping
    @Operation(summary = "Get all rides")
    public ResponseEntity<ApiResponse<Page<RideResponse>>> getAllRides(
            @PageableDefault(size = 20, sort = "dateTime", direction = Sort.Direction.ASC) Pageable pageable) {
        try {
            Page<RideResponse> response = rideService.getAllRides(pageable);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching rides: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(Page.empty(pageable)));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search rides")
    public ResponseEntity<ApiResponse<Page<RideResponse>>> searchRides(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minSeats,
            @PageableDefault(size = 20, sort = "dateTime", direction = Sort.Direction.ASC) Pageable pageable) {
        try {
            Page<RideResponse> response = rideService.searchRides(
                    source, destination, startDate, endDate, minPrice, maxPrice, minSeats, pageable);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error searching rides: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(Page.empty(pageable)));
        }
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming rides")
    public ResponseEntity<ApiResponse<List<RideResponse>>> getUpcomingRides() {
        try {
            List<RideResponse> response = rideService.getUpcomingRides();
            return ResponseEntity.ok(ApiResponse.success(response != null ? response : new ArrayList<>()));
        } catch (Exception e) {
            logger.error("Error fetching upcoming rides: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }

    @GetMapping("/my-rides")
    @Operation(summary = "Get my rides")
    public ResponseEntity<ApiResponse<List<RideResponse>>> getMyRides() {
        logger.info("GET /rides/my-rides called");
        try {
            List<RideResponse> rides = rideService.getMyRides();
            logger.info("Returning {} rides", rides.size());
            return ResponseEntity.ok(ApiResponse.success(rides));
        } catch (Exception e) {
            logger.error("Error fetching my rides: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }
}