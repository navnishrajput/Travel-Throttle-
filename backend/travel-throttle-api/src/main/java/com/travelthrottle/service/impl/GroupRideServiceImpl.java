package com.travelthrottle.service.impl;

import com.travelthrottle.dto.request.GroupRideRequest;
import com.travelthrottle.dto.response.*;
import com.travelthrottle.exception.BadRequestException;
import com.travelthrottle.exception.ResourceNotFoundException;
import com.travelthrottle.exception.UnauthorizedException;
import com.travelthrottle.model.*;
import com.travelthrottle.model.GroupRideMember.MemberStatus;
import com.travelthrottle.model.enums.GroupRideStatus;
import com.travelthrottle.repository.*;
import com.travelthrottle.service.GroupRideService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupRideServiceImpl implements GroupRideService {

    private final GroupRideRepository groupRideRepository;
    private final GroupRideMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final BikeRepository bikeRepository;

    public GroupRideServiceImpl(GroupRideRepository groupRideRepository,
                                GroupRideMemberRepository memberRepository,
                                UserRepository userRepository,
                                BikeRepository bikeRepository) {
        this.groupRideRepository = groupRideRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.bikeRepository = bikeRepository;
    }

    @Override
    @Transactional
    public GroupRideResponse createGroupRide(String userId, GroupRideRequest request) {
        User leadRider = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Bike leadBike = bikeRepository.findById(request.getLeadBikeId())
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found"));

        if (!leadBike.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Bike does not belong to you");
        }

        GroupRide groupRide = new GroupRide();
        groupRide.setGroupName(request.getGroupName());
        groupRide.setSource(request.getSource());
        groupRide.setDestination(request.getDestination());
        groupRide.setDateTime(request.getDateTime());
        groupRide.setDescription(request.getDescription());
        groupRide.setLeadRider(leadRider);
        groupRide.setLeadBike(leadBike);
        groupRide.setMaxBikes(request.getMaxBikes());
        groupRide.setCostPerPerson(request.getCostPerPerson());
        groupRide.setAllowFemaleOnly(request.getAllowFemaleOnly());
        groupRide.setIsPublic(request.getIsPublic());
        groupRide.setStatus(GroupRideStatus.UPCOMING);

        GroupRide saved = groupRideRepository.save(groupRide);
        return mapToResponse(saved, userId);
    }

    @Override
    public GroupRideResponse getGroupRide(String groupRideId, String userId) {
        GroupRide groupRide = groupRideRepository.findById(groupRideId)
                .orElseThrow(() -> new ResourceNotFoundException("Group ride not found"));
        return mapToResponse(groupRide, userId);
    }

    @Override
    public List<GroupRideResponse> getUpcomingPublicGroupRides() {
        return groupRideRepository.findUpcomingPublicGroupRides(LocalDateTime.now()).stream()
                .map(gr -> mapToResponse(gr, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupRideResponse> getUserGroupRides(String userId) {
        return groupRideRepository.findAllUserGroupRides(userId).stream()
                .map(gr -> mapToResponse(gr, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GroupRideMemberResponse joinGroupRide(String userId, String groupRideId, String bikeId, String message) {
        GroupRide groupRide = groupRideRepository.findById(groupRideId)
                .orElseThrow(() -> new ResourceNotFoundException("Group ride not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found"));

        if (groupRide.getLeadRider().getId().equals(userId)) {
            throw new BadRequestException("You are the lead rider");
        }

        if (!groupRide.canJoin()) {
            throw new BadRequestException("Group ride is full");
        }

        if (memberRepository.existsByGroupRideIdAndUserId(groupRideId, userId)) {
            throw new BadRequestException("Already requested to join");
        }

        GroupRideMember member = new GroupRideMember();
        member.setGroupRide(groupRide);
        member.setUser(user);
        member.setBike(bike);
        member.setStatus(MemberStatus.PENDING);
        member.setJoinMessage(message);

        GroupRideMember saved = memberRepository.save(member);
        return mapToMemberResponse(saved);
    }

    @Override
    @Transactional
    public GroupRideMemberResponse approveMember(String leadRiderId, String memberId) {
        GroupRideMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!member.getGroupRide().getLeadRider().getId().equals(leadRiderId)) {
            throw new UnauthorizedException("Only lead rider can approve");
        }

        member.setStatus(MemberStatus.APPROVED);
        member.setRespondedAt(LocalDateTime.now());

        return mapToMemberResponse(memberRepository.save(member));
    }

    @Override
    @Transactional
    public void rejectMember(String leadRiderId, String memberId) {
        GroupRideMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!member.getGroupRide().getLeadRider().getId().equals(leadRiderId)) {
            throw new UnauthorizedException("Only lead rider can reject");
        }

        member.setStatus(MemberStatus.REJECTED);
        member.setRespondedAt(LocalDateTime.now());
        memberRepository.save(member);
    }

    @Override
    @Transactional
    public void cancelGroupRide(String userId, String groupRideId) {
        GroupRide groupRide = groupRideRepository.findById(groupRideId)
                .orElseThrow(() -> new ResourceNotFoundException("Group ride not found"));

        if (!groupRide.getLeadRider().getId().equals(userId)) {
            throw new UnauthorizedException("Only lead rider can cancel");
        }

        groupRide.setStatus(GroupRideStatus.CANCELLED);
        groupRideRepository.save(groupRide);
    }

    @Override
    @Transactional
    public void leaveGroupRide(String userId, String groupRideId) {
        GroupRideMember member = memberRepository.findByGroupRideIdAndUserId(groupRideId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Not a member"));

        memberRepository.delete(member);
    }

    @Override
    @Transactional
    public void startGroupRide(String userId, String groupRideId) {
        GroupRide groupRide = groupRideRepository.findById(groupRideId)
                .orElseThrow(() -> new ResourceNotFoundException("Group ride not found"));

        if (!groupRide.getLeadRider().getId().equals(userId)) {
            throw new UnauthorizedException("Only lead rider can start");
        }

        groupRide.setStatus(GroupRideStatus.ONGOING);
        groupRideRepository.save(groupRide);
    }

    @Override
    @Transactional
    public void completeGroupRide(String userId, String groupRideId) {
        GroupRide groupRide = groupRideRepository.findById(groupRideId)
                .orElseThrow(() -> new ResourceNotFoundException("Group ride not found"));

        if (!groupRide.getLeadRider().getId().equals(userId)) {
            throw new UnauthorizedException("Only lead rider can complete");
        }

        groupRide.setStatus(GroupRideStatus.COMPLETED);
        groupRideRepository.save(groupRide);
    }

    private GroupRideResponse mapToResponse(GroupRide groupRide, String currentUserId) {
        GroupRideResponse response = new GroupRideResponse();
        response.setId(groupRide.getId());
        response.setGroupName(groupRide.getGroupName());
        response.setSource(groupRide.getSource());
        response.setDestination(groupRide.getDestination());
        response.setDateTime(groupRide.getDateTime());
        response.setDescription(groupRide.getDescription());
        response.setStatus(groupRide.getStatus());
        response.setCurrentBikes(groupRide.getCurrentBikesCount());
        response.setMaxBikes(groupRide.getMaxBikes());
        response.setCostPerPerson(groupRide.getCostPerPerson());
        response.setAllowFemaleOnly(groupRide.getAllowFemaleOnly());
        response.setIsPublic(groupRide.getIsPublic());
        response.setCreatedAt(groupRide.getCreatedAt());

        if (currentUserId != null) {
            response.setIsLeadRider(groupRide.isLeadRider(currentUserId));
            response.setIsMember(memberRepository.existsByGroupRideIdAndUserId(groupRide.getId(), currentUserId));
            response.setCanJoin(groupRide.canJoin() && !response.getIsLeadRider() && !response.getIsMember());
        }

        return response;
    }

    private GroupRideMemberResponse mapToMemberResponse(GroupRideMember member) {
        GroupRideMemberResponse response = new GroupRideMemberResponse();
        response.setId(member.getId());
        response.setUserId(member.getUser().getId());
        response.setUserName(member.getUser().getName());
        response.setUserAvatar(member.getUser().getAvatar());
        response.setBikeId(member.getBike().getId());
        response.setBikeModel(member.getBike().getModel());
        response.setStatus(member.getStatus());
        response.setJoinMessage(member.getJoinMessage());
        response.setCreatedAt(member.getCreatedAt());
        return response;
    }
}