package com.travelthrottle.service.impl;

import com.travelthrottle.dto.request.BikeRequest;
import com.travelthrottle.dto.response.BikeResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import com.travelthrottle.exception.BadRequestException;
import com.travelthrottle.exception.DuplicateResourceException;
import com.travelthrottle.exception.ResourceNotFoundException;
import com.travelthrottle.exception.UnauthorizedException;
import com.travelthrottle.model.Bike;
import com.travelthrottle.model.User;
import com.travelthrottle.repository.BikeRepository;
import com.travelthrottle.repository.UserRepository;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.BikeService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BikeServiceImpl implements BikeService {

    private static final Logger logger = LoggerFactory.getLogger(BikeServiceImpl.class);
    private final BikeRepository bikeRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    private static final String UPLOAD_DIR = "./uploads/bikes/";

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication: " + authentication);
        System.out.println("Principal: " + (authentication != null ? authentication.getPrincipal() : "null"));

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            String userId = ((UserDetailsImpl) principal).getId();
            System.out.println("Current user ID: " + userId);
            return userId;
        }
        throw new UnauthorizedException("Invalid authentication principal");
    }

    @Override
    public List<BikeResponse> getMyBikes() {
        System.out.println("=== BikeServiceImpl.getMyBikes() CALLED ===");
        logger.info("=== getMyBikes START ===");

        try {
            String userId = getCurrentUserId();
            System.out.println("Fetching bikes for user ID: " + userId);
            logger.info("Fetching bikes for user ID: {}", userId);

            // DIRECT JDBC QUERY - MOST RELIABLE
            String sql = "SELECT id, model, registration_number, color, year, mileage, capacity, verified, created_at FROM bikes WHERE user_id = ? ORDER BY created_at DESC";
            System.out.println("Executing SQL: " + sql);

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, userId);
            System.out.println("JDBC query returned " + rows.size() + " rows");

            List<BikeResponse> responses = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                System.out.println("Row: " + row);

                BikeResponse response = BikeResponse.builder()
                        .id((String) row.get("id"))
                        .model((String) row.get("model"))
                        .registrationNumber((String) row.get("registration_number"))
                        .color((String) row.get("color"))
                        .year(row.get("year") != null ? ((Number) row.get("year")).intValue() : null)
                        .mileage((String) row.get("mileage"))
                        .capacity(row.get("capacity") != null ? ((Number) row.get("capacity")).intValue() : 2)
                        .verified(row.get("verified") != null ? (Boolean) row.get("verified") : false)
                        .displayName(row.get("model") + " (" + row.get("color") + ") - " + row.get("registration_number"))
                        .build();

                responses.add(response);
            }

            System.out.println("Returning " + responses.size() + " bikes from direct JDBC");
            logger.info("Returning {} bikes from direct JDBC", responses.size());

            return responses;

        } catch (Exception e) {
            System.err.println("ERROR in getMyBikes: " + e.getMessage());
            e.printStackTrace();
            logger.error("Error in getMyBikes: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional
    public BikeResponse addBike(BikeRequest request) {
        System.out.println("=== addBike START ===");
        System.out.println("Request: model=" + request.getModel() + ", regNumber=" + request.getRegistrationNumber());

        String userId = getCurrentUserId();
        System.out.println("User ID: " + userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        System.out.println("User found: " + user.getName() + " (" + user.getEmail() + ")");

        // Check bike limit
        Long bikeCount = bikeRepository.countBikesByUser(user.getId());
        if (bikeCount >= 5) {
            throw new BadRequestException("Maximum 5 bikes allowed per user");
        }

        // Check registration number uniqueness
        String regNumber = request.getRegistrationNumber().trim().toUpperCase();
        if (bikeRepository.existsByRegistrationNumber(regNumber)) {
            throw DuplicateResourceException.registrationNumberExists(regNumber);
        }

        // Create and save bike
        Bike bike = Bike.builder()
                .model(request.getModel().trim())
                .registrationNumber(regNumber)
                .color(request.getColor().trim())
                .year(request.getYear())
                .mileage(request.getMileage())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 2)
                .description(request.getDescription())
                .user(user)
                .verified(false)
                .build();

        System.out.println("Saving bike to database...");
        Bike savedBike = bikeRepository.save(bike);
        System.out.println("Bike saved with ID: " + savedBike.getId());

        // Update user's hasBike status
        if (user.getHasBike() == null || !user.getHasBike()) {
            user.setHasBike(true);
            userRepository.save(user);
        }

        System.out.println("=== addBike END ===");
        return mapToResponse(savedBike);
    }

    @Override
    public BikeResponse getBikeById(String bikeId) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> ResourceNotFoundException.bike(bikeId));
        return mapToResponse(bike);
    }

    @Override
    @Transactional
    public BikeResponse updateBike(String bikeId, BikeRequest request) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> ResourceNotFoundException.bike(bikeId));

        String userId = getCurrentUserId();
        if (!bike.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't own this bike");
        }

        bike.setModel(request.getModel().trim());
        bike.setColor(request.getColor().trim());
        bike.setYear(request.getYear());
        bike.setMileage(request.getMileage());
        bike.setCapacity(request.getCapacity());
        bike.setDescription(request.getDescription());

        Bike savedBike = bikeRepository.save(bike);
        return mapToResponse(savedBike);
    }

    @Override
    @Transactional
    public void deleteBike(String bikeId) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> ResourceNotFoundException.bike(bikeId));

        String userId = getCurrentUserId();
        if (!bike.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't own this bike");
        }

        bikeRepository.delete(bike);

        Long remainingBikes = bikeRepository.countBikesByUser(userId);
        if (remainingBikes == 0) {
            User user = bike.getUser();
            user.setHasBike(false);
            userRepository.save(user);
        }
    }

    @Override
    public List<BikeResponse> getUserBikes(String userId) {
        String sql = "SELECT id, model, registration_number, color, year, mileage, capacity, verified FROM bikes WHERE user_id = ?";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, userId);

        return rows.stream().map(row -> BikeResponse.builder()
                        .id((String) row.get("id"))
                        .model((String) row.get("model"))
                        .registrationNumber((String) row.get("registration_number"))
                        .color((String) row.get("color"))
                        .year(row.get("year") != null ? ((Number) row.get("year")).intValue() : null)
                        .mileage((String) row.get("mileage"))
                        .capacity(row.get("capacity") != null ? ((Number) row.get("capacity")).intValue() : 2)
                        .verified(row.get("verified") != null ? (Boolean) row.get("verified") : false)
                        .displayName(row.get("model") + " (" + row.get("color") + ") - " + row.get("registration_number"))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<BikeResponse> getAvailableBikesForUser(String userId) {
        return getUserBikes(userId).stream()
                .filter(BikeResponse::getVerified)
                .collect(Collectors.toList());
    }

    @Override
    public BikeResponse uploadBikeImage(String bikeId, MultipartFile file) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> ResourceNotFoundException.bike(bikeId));

        String userId = getCurrentUserId();
        if (!bike.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't own this bike");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            if (bike.getImageUrl() != null) {
                try {
                    Files.deleteIfExists(Paths.get(UPLOAD_DIR + bike.getImageUrl()));
                } catch (IOException e) {}
            }

            bike.setImageUrl(filename);
            Bike savedBike = bikeRepository.save(bike);
            return mapToResponse(savedBike);

        } catch (IOException e) {
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void verifyBike(String bikeId) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> ResourceNotFoundException.bike(bikeId));
        bike.setVerified(true);
        bikeRepository.save(bike);
    }

    @Override
    public boolean isBikeAvailable(String bikeId) {
        return bikeRepository.findById(bikeId)
                .map(Bike::getVerified)
                .orElse(false);
    }

    @Override
    public Long countUserBikes(String userId) {
        return bikeRepository.countBikesByUser(userId);
    }

    @Override
    public boolean existsByRegistrationNumber(String registrationNumber) {
        return bikeRepository.existsByRegistrationNumber(registrationNumber);
    }

    private BikeResponse mapToResponse(Bike bike) {
        if (bike == null) return null;

        UserSummaryResponse owner = null;
        if (bike.getUser() != null) {
            owner = UserSummaryResponse.builder()
                    .id(bike.getUser().getId())
                    .name(bike.getUser().getName())
                    .email(bike.getUser().getEmail())
                    .avatar(bike.getUser().getAvatar())
                    .build();
        }

        return BikeResponse.builder()
                .id(bike.getId())
                .model(bike.getModel())
                .registrationNumber(bike.getRegistrationNumber())
                .color(bike.getColor())
                .year(bike.getYear())
                .mileage(bike.getMileage())
                .capacity(bike.getCapacity())
                .verified(bike.getVerified())
                .description(bike.getDescription())
                .createdAt(bike.getCreatedAt())
                .owner(owner)
                .displayName(bike.getDisplayName())
                .build();
    }
}