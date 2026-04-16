package com.travelthrottle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private Double rating;
    private Integer totalRides;
    private Boolean verified;
    private Boolean hasBike;
    private String initials;
    private String phone;
}