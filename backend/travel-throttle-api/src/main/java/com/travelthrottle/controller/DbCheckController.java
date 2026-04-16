package com.travelthrottle.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/db-check")
public class DbCheckController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/connection")
    public ResponseEntity<Map<String, Object>> checkConnection() {
        Map<String, Object> response = new HashMap<>();

        try (Connection conn = dataSource.getConnection()) {
            response.put("connected", true);
            response.put("database", conn.getCatalog());
            response.put("url", conn.getMetaData().getURL());
            response.put("username", conn.getMetaData().getUserName());
        } catch (Exception e) {
            response.put("connected", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tables")
    public ResponseEntity<Map<String, Object>> checkTables() {
        Map<String, Object> response = new HashMap<>();

        try {
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            Integer bikeCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM bikes", Integer.class);
            Integer rideCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM rides", Integer.class);

            response.put("users", userCount);
            response.put("bikes", bikeCount);
            response.put("rides", rideCount);
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-insert")
    public ResponseEntity<Map<String, Object>> testInsert() {
        Map<String, Object> response = new HashMap<>();

        try {
            String testId = "test-" + System.currentTimeMillis();
            jdbcTemplate.update(
                    "INSERT INTO users (id, name, email, phone, password, has_bike, verified, created_at) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
                    testId, "Test User", "test@test.com", "9999999999", "password", true, false
            );

            response.put("inserted", true);
            response.put("id", testId);

            // Clean up
            jdbcTemplate.update("DELETE FROM users WHERE id = ?", testId);
        } catch (Exception e) {
            response.put("inserted", false);
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getName());
        }

        return ResponseEntity.ok(response);
    }
}