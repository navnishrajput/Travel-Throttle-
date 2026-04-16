package com.travelthrottle.service;

import com.travelthrottle.dto.request.UpdateProfileRequest;
import com.travelthrottle.dto.response.UserResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface UserService {
    UserResponse getCurrentUser();
    UserResponse getUserById(String userId);
    UserSummaryResponse getUserSummary(String userId);
    UserResponse updateProfile(UpdateProfileRequest request);
    UserResponse uploadAvatar(MultipartFile file);
    void deleteAvatar();
    Page<UserResponse> getAllUsers(Pageable pageable);
    List<UserResponse> searchUsers(String query);
    List<UserSummaryResponse> getTopRatedUsers(int limit);
    void verifyUser(String userId);
    void updateUserStats(String userId, Double rating, Integer totalRides);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}