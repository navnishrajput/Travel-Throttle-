package com.travelthrottle.controller;

import com.travelthrottle.dto.request.BikeRequest;
import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.BikeResponse;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.BikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bikes")
@RequiredArgsConstructor
@Tag(name = "Bike", description = "Bike management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class BikeController {

    private static final Logger logger = LoggerFactory.getLogger(BikeController.class);
    private final BikeService bikeService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return "unknown";
    }

    @GetMapping("/my-bikes")
    @Operation(summary = "Get my bikes")
    public ResponseEntity<ApiResponse<List<BikeResponse>>> getMyBikes() {
        logger.info("=== GET /my-bikes called ===");

        try {
            String userId = getCurrentUserId();
            logger.info("User ID from token: {}", userId);

            List<BikeResponse> bikes = bikeService.getMyBikes();
            logger.info("Returning {} bikes", bikes.size());

            // Ensure we always return a list (even if empty)
            if (bikes == null) {
                bikes = new ArrayList<>();
            }

            return ResponseEntity.ok(ApiResponse.success(bikes));

        } catch (Exception e) {
            logger.error("Error in getMyBikes: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }
    }

    @PostMapping
    @Operation(summary = "Add bike")
    public ResponseEntity<ApiResponse<BikeResponse>> addBike(@Valid @RequestBody BikeRequest request) {
        logger.info("=== POST /bikes called ===");
        logger.info("Adding bike - Model: {}, Reg: {}", request.getModel(), request.getRegistrationNumber());

        try {
            BikeResponse response = bikeService.addBike(request);
            logger.info("Bike added successfully with ID: {}", response.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Bike added successfully", response));
        } catch (Exception e) {
            logger.error("Error adding bike: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{bikeId}")
    @Operation(summary = "Get bike by ID")
    public ResponseEntity<ApiResponse<BikeResponse>> getBikeById(@PathVariable String bikeId) {
        try {
            BikeResponse response = bikeService.getBikeById(bikeId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching bike {}: {}", bikeId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Bike not found"));
        }
    }

    @PutMapping("/{bikeId}")
    @Operation(summary = "Update bike")
    public ResponseEntity<ApiResponse<BikeResponse>> updateBike(
            @PathVariable String bikeId,
            @Valid @RequestBody BikeRequest request) {
        try {
            BikeResponse response = bikeService.updateBike(bikeId, request);
            return ResponseEntity.ok(ApiResponse.success("Bike updated successfully", response));
        } catch (Exception e) {
            logger.error("Error updating bike {}: {}", bikeId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{bikeId}")
    @Operation(summary = "Delete bike")
    public ResponseEntity<ApiResponse<Void>> deleteBike(@PathVariable String bikeId) {
        try {
            bikeService.deleteBike(bikeId);
            return ResponseEntity.ok(ApiResponse.success("Bike deleted successfully", null));
        } catch (Exception e) {
            logger.error("Error deleting bike {}: {}", bikeId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/check-registration")
    @Operation(summary = "Check registration number")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkRegistrationNumber(
            @RequestParam String registrationNumber) {
        try {
            boolean exists = bikeService.existsByRegistrationNumber(registrationNumber);
            Map<String, Boolean> result = new HashMap<>();
            result.put("exists", exists);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            logger.error("Error checking registration: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }
}