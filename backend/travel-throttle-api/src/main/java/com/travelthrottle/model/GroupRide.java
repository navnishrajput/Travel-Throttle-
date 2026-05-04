package com.travelthrottle.model;

import com.travelthrottle.model.enums.GroupRideStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "group_rides")
public class GroupRide {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String groupName;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lead_rider_id", nullable = false)
    private User leadRider;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lead_bike_id", nullable = false)
    private Bike leadBike;

    // CRITICAL FIX: Change to EAGER fetching
    @OneToMany(mappedBy = "groupRide", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Set<GroupRideMember> members = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupRideStatus status = GroupRideStatus.UPCOMING;

    private Integer maxBikes = 10;
    private Double costPerPerson;
    private Boolean allowFemaleOnly = false;
    private Boolean isPublic = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

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

    public User getLeadRider() { return leadRider; }
    public void setLeadRider(User leadRider) { this.leadRider = leadRider; }

    public Bike getLeadBike() { return leadBike; }
    public void setLeadBike(Bike leadBike) { this.leadBike = leadBike; }

    public Set<GroupRideMember> getMembers() { return members; }
    public void setMembers(Set<GroupRideMember> members) { this.members = members; }

    public GroupRideStatus getStatus() { return status; }
    public void setStatus(GroupRideStatus status) { this.status = status; }

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

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // FIXED: Safe method that works with EAGER fetching
    public int getCurrentBikesCount() {
        if (members == null) return 1;
        return (int) members.stream()
                .filter(m -> m.getStatus() == GroupRideMember.MemberStatus.APPROVED)
                .count() + 1;
    }

    public boolean canJoin() {
        return status == GroupRideStatus.UPCOMING && getCurrentBikesCount() < maxBikes;
    }

    public boolean isLeadRider(String userId) {
        return leadRider != null && leadRider.getId().equals(userId);
    }
}