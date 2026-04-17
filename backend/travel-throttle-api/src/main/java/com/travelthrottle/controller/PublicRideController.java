package com.travelthrottle.controller;

import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.RideResponse;
import com.travelthrottle.service.PublicRideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/public/rides")
@RequiredArgsConstructor
@Tag(name = "Public Ride", description = "Public ride endpoints (no authentication required)")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class PublicRideController {

    private static final Logger logger = LoggerFactory.getLogger(PublicRideController.class);
    private final PublicRideService publicRideService;

    @GetMapping
    @Operation(summary = "Get all upcoming rides (public)")
    public ResponseEntity<ApiResponse<List<RideResponse>>> getAllPublicRides() {
        logger.info("=== PUBLIC GET ALL RIDES ===");
        try {
            List<RideResponse> rides = publicRideService.getAllUpcomingRides();
            logger.info("Returning {} rides", rides.size());
            return ResponseEntity.ok(ApiResponse.success(rides));
        } catch (Exception e) {
            logger.error("Error fetching public rides: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming rides (public)")
    public ResponseEntity<ApiResponse<List<RideResponse>>> getUpcomingRides() {
        logger.info("=== PUBLIC GET UPCOMING RIDES ===");
        try {
            List<RideResponse> rides = publicRideService.getUpcomingRides();
            logger.info("Returning {} upcoming rides", rides.size());
            return ResponseEntity.ok(ApiResponse.success(rides));
        } catch (Exception e) {
            logger.error("Error fetching upcoming rides: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search rides (public)")
    public ResponseEntity<ApiResponse<List<RideResponse>>> searchRides(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minSeats) {

        logger.info("=== PUBLIC SEARCH RIDES ===");
        logger.info("Source: {}, Destination: {}, Date: {}, MaxPrice: {}, MinSeats: {}",
                source, destination, date, maxPrice, minSeats);

        try {
            List<RideResponse> rides = publicRideService.searchRides(source, destination, date, maxPrice, minSeats);
            logger.info("Found {} rides matching criteria", rides.size());
            return ResponseEntity.ok(ApiResponse.success(rides));
        } catch (Exception e) {
            logger.error("Error searching rides: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }

    @GetMapping("/{rideId}")
    @Operation(summary = "Get ride by ID (public)")
    public ResponseEntity<ApiResponse<RideResponse>> getRideById(@PathVariable String rideId) {
        logger.info("=== PUBLIC GET RIDE BY ID: {} ===", rideId);
        try {
            RideResponse ride = publicRideService.getRideById(rideId);
            return ResponseEntity.ok(ApiResponse.success(ride));
        } catch (Exception e) {
            logger.error("Error fetching ride {}: {}", rideId, e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Ride not found"));
        }
    }

    @GetMapping("/filter")
    @Operation(summary = "Filter rides with multiple criteria (public)")
    public ResponseEntity<ApiResponse<List<RideResponse>>> filterRides(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false) Integer maxSeats) {

        logger.info("=== PUBLIC FILTER RIDES ===");
        try {
            List<RideResponse> rides = publicRideService.filterRides(
                    source, destination, fromDate, toDate, minPrice, maxPrice, minSeats, maxSeats);
            logger.info("Found {} rides matching filters", rides.size());
            return ResponseEntity.ok(ApiResponse.success(rides));
        } catch (Exception e) {
            logger.error("Error filtering rides: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }
}