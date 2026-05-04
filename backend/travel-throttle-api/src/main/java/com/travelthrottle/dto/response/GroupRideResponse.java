package com.travelthrottle.dto.response;

import com.travelthrottle.model.enums.GroupRideStatus;
import java.time.LocalDateTime;
import java.util.List;

public class GroupRideResponse {
    private String id;
    private String groupName;
    private String source;
    private String destination;
    private LocalDateTime dateTime;
    private String description;
    private UserSummaryResponse leadRider;
    private BikeResponse leadBike;
    private List<GroupRideMemberResponse> members;
    private GroupRideStatus status;
    private Integer currentBikes;
    private Integer maxBikes;
    private Double costPerPerson;
    private Boolean allowFemaleOnly;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private Boolean isLeadRider;
    private Boolean isMember;
    private Boolean canJoin;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UserSummaryResponse getLeadRider() { return leadRider; }
    public void setLeadRider(UserSummaryResponse leadRider) { this.leadRider = leadRider; }

    public BikeResponse getLeadBike() { return leadBike; }
    public void setLeadBike(BikeResponse leadBike) { this.leadBike = leadBike; }

    public List<GroupRideMemberResponse> getMembers() { return members; }
    public void setMembers(List<GroupRideMemberResponse> members) { this.members = members; }

    public GroupRideStatus getStatus() { return status; }
    public void setStatus(GroupRideStatus status) { this.status = status; }

    public Integer getCurrentBikes() { return currentBikes; }
    public void setCurrentBikes(Integer currentBikes) { this.currentBikes = currentBikes; }

    public Integer getMaxBikes() { return maxBikes; }
    public void setMaxBikes(Integer maxBikes) { this.maxBikes = maxBikes; }

    public Double getCostPerPerson() { return costPerPerson; }
    public void setCostPerPerson(Double costPerPerson) { this.costPerPerson = costPerPerson; }

    public Boolean getAllowFemaleOnly() { return allowFemaleOnly; }
    public void setAllowFemaleOnly(Boolean allowFemaleOnly) { this.allowFemaleOnly = allowFemaleOnly; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getIsLeadRider() { return isLeadRider; }
    public void setIsLeadRider(Boolean isLeadRider) { this.isLeadRider = isLeadRider; }

    public Boolean getIsMember() { return isMember; }
    public void setIsMember(Boolean isMember) { this.isMember = isMember; }

    public Boolean getCanJoin() { return canJoin; }
    public void setCanJoin(Boolean canJoin) { this.canJoin = canJoin; }
}