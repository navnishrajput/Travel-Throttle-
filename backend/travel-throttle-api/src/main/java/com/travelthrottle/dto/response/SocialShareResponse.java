package com.travelthrottle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialShareResponse {
    private String shareUrl;
    private String platform;
    private String rideId;
    private String shareText;
    private String deepLink;
}