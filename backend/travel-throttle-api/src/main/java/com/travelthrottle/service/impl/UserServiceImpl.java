package com.travelthrottle.service.impl;

import com.travelthrottle.dto.request.UpdateProfileRequest;
import com.travelthrottle.dto.response.UserResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import com.travelthrottle.exception.BadRequestException;
import com.travelthrottle.exception.DuplicateResourceException;
import com.travelthrottle.exception.ResourceNotFoundException;
import com.travelthrottle.exception.UnauthorizedException;
import com.travelthrottle.model.User;
import com.travelthrottle.repository.BikeRepository;
import com.travelthrottle.repository.ReviewRepository;
import com.travelthrottle.repository.UserRepository;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final BikeRepository bikeRepository;
    private final ReviewRepository reviewRepository;
    private static final String UPLOAD_DIR = "./uploads/avatars/";

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new UnauthorizedException("User not authenticated");
    }

    @Override
    public UserResponse getCurrentUser() {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
        return mapToUserResponse(user);
    }

    @Override
    public UserSummaryResponse getUserSummary(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
        return mapToUserSummaryResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw DuplicateResourceException.emailAlreadyExists(request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw DuplicateResourceException.phoneAlreadyExists(request.getPhone());
            }
            user.setPhone(request.getPhone());
        }
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getAddress() != null) user.setAddress(request.getAddress());

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse uploadAvatar(MultipartFile file) {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            if (user.getAvatar() != null) {
                try {
                    Files.deleteIfExists(Paths.get(UPLOAD_DIR + user.getAvatar()));
                } catch (IOException e) {}
            }

            user.setAvatar(filename);
            User savedUser = userRepository.save(user);
            return mapToUserResponse(savedUser);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload avatar");
        }
    }

    @Override
    @Transactional
    public void deleteAvatar() {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        if (user.getAvatar() != null) {
            try {
                Files.deleteIfExists(Paths.get(UPLOAD_DIR + user.getAvatar()));
            } catch (IOException e) {}
            user.setAvatar(null);
            userRepository.save(user);
        }
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToUserResponse);
    }

    @Override
    public List<UserResponse> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) return new ArrayList<>();
        return userRepository.findByNameContainingIgnoreCase(query).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserSummaryResponse> getTopRatedUsers(int limit) {
        return userRepository.findTopRatedUsers(4.0, Pageable.ofSize(limit))
                .stream().map(this::mapToUserSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void verifyUser(String userId) {
        userRepository.verifyUser(userId);
    }

    @Override
    @Transactional
    public void updateUserStats(String userId, Double rating, Integer totalRides) {
        userRepository.updateUserStats(userId, rating, totalRides);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }

    private UserResponse mapToUserResponse(User user) {
        if (user == null) return null;

        Long bikeCount = bikeRepository.countBikesByUser(user.getId());
        Long reviewCount = reviewRepository.countByReviewedId(user.getId()); // FIXED: countByReviewedId

        return UserResponse.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .phone(user.getPhone()).hasBike(user.getHasBike()).avatar(user.getAvatar())
                .verified(user.getVerified()).rating(user.getRating()).totalRides(user.getTotalRides())
                .totalDistance(user.getTotalDistance()).totalSaved(user.getTotalSaved())
                .bio(user.getBio()).address(user.getAddress()).roles(user.getRoles())
                .createdAt(user.getCreatedAt()).lastLogin(user.getLastLogin())
                .initials(user.getInitials()).bikeCount(bikeCount).reviewCount(reviewCount)
                .build();
    }

    private UserSummaryResponse mapToUserSummaryResponse(User user) {
        if (user == null) return null;

        return UserSummaryResponse.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .avatar(user.getAvatar()).rating(user.getRating()).totalRides(user.getTotalRides())
                .verified(user.getVerified()).hasBike(user.getHasBike())
                .initials(user.getInitials()).phone(user.getPhone())
                .build();
    }
}