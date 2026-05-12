package com.travelthrottle.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Welcome to Travel Throttle API! 🏍️");
        response.put("app", "Travel Throttle - Bike Ride Sharing Platform");
        response.put("version", "1.0");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("documentation", "/swagger-ui/index.html");
        response.put("apiDocs", "/v3/api-docs");
        response.put("publicEndpoints", Map.of(
                "login", "/api/auth/login",
                "signup", "/api/auth/signup",
                "publicRides", "/api/public/rides/upcoming",
                "healthCheck", "/api/db-check/connection"
        ));
        response.put("status", "running");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> apiHome() {
        return home();
    }
}