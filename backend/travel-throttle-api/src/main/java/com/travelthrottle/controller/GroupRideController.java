package com.travelthrottle.controller;

import com.travelthrottle.dto.request.GroupRideRequest;
import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.GroupRideMemberResponse;
import com.travelthrottle.dto.response.GroupRideResponse;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.GroupRideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/group-rides")
@Tag(name = "Group Ride", description = "Multi-bike group ride endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class GroupRideController {

    private final GroupRideService groupRideService;

    public GroupRideController(GroupRideService groupRideService) {
        this.groupRideService = groupRideService;
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @PostMapping
    @Operation(summary = "Create a group ride")
    public ResponseEntity<ApiResponse<GroupRideResponse>> createGroupRide(@Valid @RequestBody GroupRideRequest request) {
        String userId = getCurrentUserId();
        GroupRideResponse response = groupRideService.createGroupRide(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Group ride created", response));
    }

    @GetMapping
    @Operation(summary = "Get upcoming public group rides")
    public ResponseEntity<ApiResponse<List<GroupRideResponse>>> getUpcomingGroupRides() {
        List<GroupRideResponse> rides = groupRideService.getUpcomingPublicGroupRides();
        return ResponseEntity.ok(ApiResponse.success(rides));
    }

    @GetMapping("/my")
    @Operation(summary = "Get user's group rides")
    public ResponseEntity<ApiResponse<List<GroupRideResponse>>> getMyGroupRides() {
        String userId = getCurrentUserId();
        List<GroupRideResponse> rides = groupRideService.getUserGroupRides(userId);
        return ResponseEntity.ok(ApiResponse.success(rides));
    }

    @GetMapping("/{groupId}")
    @Operation(summary = "Get group ride by ID")
    public ResponseEntity<ApiResponse<GroupRideResponse>> getGroupRide(@PathVariable String groupId) {
        String userId = getCurrentUserId();
        GroupRideResponse response = groupRideService.getGroupRide(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{groupId}/join")
    @Operation(summary = "Join a group ride")
    public ResponseEntity<ApiResponse<GroupRideMemberResponse>> joinGroupRide(
            @PathVariable String groupId,
            @RequestParam String bikeId,
            @RequestParam(required = false) String message) {
        String userId = getCurrentUserId();
        GroupRideMemberResponse response = groupRideService.joinGroupRide(userId, groupId, bikeId, message);
        return ResponseEntity.ok(ApiResponse.success("Join request sent", response));
    }

    @PutMapping("/members/{memberId}/approve")
    @Operation(summary = "Approve a member")
    public ResponseEntity<ApiResponse<GroupRideMemberResponse>> approveMember(@PathVariable String memberId) {
        String userId = getCurrentUserId();
        GroupRideMemberResponse response = groupRideService.approveMember(userId, memberId);
        return ResponseEntity.ok(ApiResponse.success("Member approved", response));
    }

    @PutMapping("/members/{memberId}/reject")
    @Operation(summary = "Reject a member")
    public ResponseEntity<ApiResponse<Void>> rejectMember(@PathVariable String memberId) {
        String userId = getCurrentUserId();
        groupRideService.rejectMember(userId, memberId);
        return ResponseEntity.ok(ApiResponse.success("Member rejected", null));
    }

    @PutMapping("/{groupId}/cancel")
    @Operation(summary = "Cancel group ride")
    public ResponseEntity<ApiResponse<Void>> cancelGroupRide(@PathVariable String groupId) {
        String userId = getCurrentUserId();
        groupRideService.cancelGroupRide(userId, groupId);
        return ResponseEntity.ok(ApiResponse.success("Group ride cancelled", null));
    }

    @DeleteMapping("/{groupId}/leave")
    @Operation(summary = "Leave group ride")
    public ResponseEntity<ApiResponse<Void>> leaveGroupRide(@PathVariable String groupId) {
        String userId = getCurrentUserId();
        groupRideService.leaveGroupRide(userId, groupId);
        return ResponseEntity.ok(ApiResponse.success("Left group ride", null));
    }

    @PutMapping("/{groupId}/start")
    @Operation(summary = "Start group ride")
    public ResponseEntity<ApiResponse<Void>> startGroupRide(@PathVariable String groupId) {
        String userId = getCurrentUserId();
        groupRideService.startGroupRide(userId, groupId);
        return ResponseEntity.ok(ApiResponse.success("Group ride started", null));
    }

    @PutMapping("/{groupId}/complete")
    @Operation(summary = "Complete group ride")
    public ResponseEntity<ApiResponse<Void>> completeGroupRide(@PathVariable String groupId) {
        String userId = getCurrentUserId();
        groupRideService.completeGroupRide(userId, groupId);
        return ResponseEntity.ok(ApiResponse.success("Group ride completed", null));
    }
}