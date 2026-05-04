package com.travelthrottle.service;

import com.travelthrottle.dto.request.GroupRideRequest;
import com.travelthrottle.dto.response.GroupRideMemberResponse;
import com.travelthrottle.dto.response.GroupRideResponse;
import java.util.List;

public interface GroupRideService {

    GroupRideResponse createGroupRide(String userId, GroupRideRequest request);

    GroupRideResponse getGroupRide(String groupRideId, String userId);

    List<GroupRideResponse> getUpcomingPublicGroupRides();

    List<GroupRideResponse> getUserGroupRides(String userId);

    GroupRideMemberResponse joinGroupRide(String userId, String groupRideId, String bikeId, String message);

    GroupRideMemberResponse approveMember(String leadRiderId, String memberId);

    void rejectMember(String leadRiderId, String memberId);

    void cancelGroupRide(String userId, String groupRideId);

    void leaveGroupRide(String userId, String groupRideId);

    void startGroupRide(String userId, String groupRideId);

    void completeGroupRide(String userId, String groupRideId);
}