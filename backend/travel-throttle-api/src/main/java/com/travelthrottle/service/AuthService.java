package com.travelthrottle.service;

import com.travelthrottle.dto.request.LoginRequest;
import com.travelthrottle.dto.request.SignupRequest;
import com.travelthrottle.dto.response.JwtResponse;
import com.travelthrottle.dto.response.UserResponse;

public interface AuthService {

    JwtResponse login(LoginRequest loginRequest);

    UserResponse signup(SignupRequest signupRequest);

    JwtResponse refreshToken(String refreshToken);

    void logout(String token);

    void verifyEmail(String token);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    void changePassword(String userId, String oldPassword, String newPassword);
}