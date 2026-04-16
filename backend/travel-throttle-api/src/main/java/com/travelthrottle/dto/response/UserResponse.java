package com.travelthrottle.dto.response;

import com.travelthrottle.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private Boolean hasBike;
    private String avatar;
    private Boolean verified;
    private Double rating;
    private Integer totalRides;
    private Integer totalDistance;
    private Double totalSaved;
    private String bio;
    private String address;
    private Set<UserRole> roles;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private String initials;
    private Long bikeCount;
    private Long reviewCount;
}