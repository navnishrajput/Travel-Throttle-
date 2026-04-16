package com.travelthrottle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String refreshToken;
    private String id;
    private String name;
    private String email;
    private List<String> roles;
    private Boolean hasBike;
    private String avatar;

    public JwtResponse(String token, String refreshToken, String id, String name,
                       String email, List<String> roles, Boolean hasBike, String avatar) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
        this.hasBike = hasBike;
        this.avatar = avatar;
    }
}