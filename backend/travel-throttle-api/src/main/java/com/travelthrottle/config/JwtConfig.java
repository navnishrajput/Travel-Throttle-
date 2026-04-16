package com.travelthrottle.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig {

    private String secret;
    private Long expiration = 2592000000L;      // 30 days
    private Long refreshExpiration = 7776000000L; // 90 days

    public long getExpirationInSeconds() {
        return expiration / 1000;
    }

    public long getRefreshExpirationInSeconds() {
        return refreshExpiration / 1000;
    }
}