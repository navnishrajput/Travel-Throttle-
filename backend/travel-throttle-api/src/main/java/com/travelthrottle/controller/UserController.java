package com.travelthrottle.controller;

import com.travelthrottle.dto.request.UpdateProfileRequest;
import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.UserResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import com.travelthrottle.exception.UnauthorizedException;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.UserService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        }
        throw new UnauthorizedException("Invalid authentication");
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get profile of authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        try {
            UserResponse response = userService.getCurrentUser();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching current user: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to fetch user profile"));
        }
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile", description = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            UserResponse response = userService.updateProfile(request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
        } catch (Exception e) {
            logger.error("Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to update profile"));
        }
    }

    @PostMapping("/me/avatar")
    @Operation(summary = "Upload avatar", description = "Upload profile picture")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File size exceeds 10MB limit"));
            }
            UserResponse response = userService.uploadAvatar(file);
            return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", response));
        } catch (Exception e) {
            logger.error("Error uploading avatar: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to upload avatar"));
        }
    }

    @DeleteMapping("/me/avatar")
    @Operation(summary = "Delete avatar", description = "Delete profile picture")
    public ResponseEntity<ApiResponse<Void>> deleteAvatar() {
        try {
            userService.deleteAvatar();
            return ResponseEntity.ok(ApiResponse.success("Avatar deleted successfully", null));
        } catch (Exception e) {
            logger.error("Error deleting avatar: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to delete avatar"));
        }
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID", description = "Get public profile of a user")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String userId) {
        try {
            UserResponse response = userService.getUserById(userId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("User not found"));
        }
    }

    @GetMapping("/{userId}/summary")
    @Operation(summary = "Get user summary", description = "Get summary of a user")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getUserSummary(@PathVariable String userId) {
        try {
            UserSummaryResponse response = userService.getUserSummary(userId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching user summary {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("User not found"));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Get paginated list of all users (Admin only)")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            Page<UserResponse> response = userService.getAllUsers(pageable);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching all users: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to fetch users"));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by name")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(@RequestParam String query) {
        try {
            List<UserResponse> response = userService.searchUsers(query);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error searching users: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Search failed"));
        }
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated users", description = "Get users with highest ratings")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getTopRatedUsers(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<UserSummaryResponse> response = userService.getTopRatedUsers(limit);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching top rated users: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to fetch top rated users"));
        }
    }

    @PutMapping("/{userId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify user", description = "Mark user as verified (Admin only)")
    public ResponseEntity<ApiResponse<Void>> verifyUser(@PathVariable String userId) {
        try {
            userService.verifyUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User verified successfully", null));
        } catch (Exception e) {
            logger.error("Error verifying user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to verify user"));
        }
    }

    @GetMapping("/check-email")
    @Operation(summary = "Check email availability", description = "Check if email is already taken")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailAvailability(@RequestParam String email) {
        try {
            boolean exists = userService.existsByEmail(email);
            return ResponseEntity.ok(ApiResponse.success(!exists));
        } catch (Exception e) {
            logger.error("Error checking email: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to check email"));
        }
    }

    @GetMapping("/check-phone")
    @Operation(summary = "Check phone availability", description = "Check if phone is already taken")
    public ResponseEntity<ApiResponse<Boolean>> checkPhoneAvailability(@RequestParam String phone) {
        try {
            boolean exists = userService.existsByPhone(phone);
            return ResponseEntity.ok(ApiResponse.success(!exists));
        } catch (Exception e) {
            logger.error("Error checking phone: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("Failed to check phone"));
        }
    }
}