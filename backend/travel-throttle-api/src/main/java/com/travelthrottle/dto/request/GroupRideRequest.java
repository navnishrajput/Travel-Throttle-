package com.travelthrottle.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class GroupRideRequest {

    @NotBlank(message = "Group name is required")
    @Size(max = 100)
    private String groupName;

    @NotBlank(message = "Source is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Date and time is required")
    @Future(message = "Ride date must be in the future")
    private LocalDateTime dateTime;

    private String description;

    @NotNull(message = "Lead rider bike ID is required")
    private String leadBikeId;

    @Min(2) @Max(20)
    private Integer maxBikes = 10;

    private Double costPerPerson;
    private Boolean allowFemaleOnly = false;
    private Boolean isPublic = true;

    // Getters and Setters
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

    public String getLeadBikeId() { return leadBikeId; }
    public void setLeadBikeId(String leadBikeId) { this.leadBikeId = leadBikeId; }

    public Integer getMaxBikes() { return maxBikes; }
    public void setMaxBikes(Integer maxBikes) { this.maxBikes = maxBikes; }

    public Double getCostPerPerson() { return costPerPerson; }
    public void setCostPerPerson(Double costPerPerson) { this.costPerPerson = costPerPerson; }

    public Boolean getAllowFemaleOnly() { return allowFemaleOnly; }
    public void setAllowFemaleOnly(Boolean allowFemaleOnly) { this.allowFemaleOnly = allowFemaleOnly; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
}