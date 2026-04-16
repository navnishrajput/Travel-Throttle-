package com.travelthrottle.service.impl;

import com.travelthrottle.dto.request.LoginRequest;
import com.travelthrottle.dto.request.SignupRequest;
import com.travelthrottle.dto.response.JwtResponse;
import com.travelthrottle.dto.response.UserResponse;
import com.travelthrottle.exception.DuplicateResourceException;
import com.travelthrottle.model.User;
import com.travelthrottle.model.enums.UserRole;
import com.travelthrottle.repository.UserRepository;
import com.travelthrottle.security.jwt.JwtUtils;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public UserResponse signup(SignupRequest signupRequest) {
        logger.info("=== SIGNUP START ===");
        logger.info("Email: {}, Phone: {}, Name: {}",
                signupRequest.getEmail(),
                signupRequest.getPhone(),
                signupRequest.getName());

        // Check email exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            logger.error("Email already exists: {}", signupRequest.getEmail());
            throw DuplicateResourceException.emailAlreadyExists(signupRequest.getEmail());
        }

        // Check phone exists
        if (userRepository.existsByPhone(signupRequest.getPhone())) {
            logger.error("Phone already exists: {}", signupRequest.getPhone());
            throw DuplicateResourceException.phoneAlreadyExists(signupRequest.getPhone());
        }

        // Create new user
        User user = new User();
        user.setName(signupRequest.getName().trim());
        user.setEmail(signupRequest.getEmail().toLowerCase().trim());
        user.setPhone(signupRequest.getPhone().trim());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setHasBike(signupRequest.getHasBike() != null ? signupRequest.getHasBike() : false);
        user.setVerified(false);
        user.setRating(0.0);
        user.setTotalRides(0);
        user.setTotalDistance(0);
        user.setTotalSaved(0.0);
        user.setCreatedAt(LocalDateTime.now());
        user.setRoles(Set.of(UserRole.ROLE_USER));

        logger.info("Saving user to database...");
        User savedUser = userRepository.save(user);
        logger.info("=== USER SAVED SUCCESSFULLY ===");
        logger.info("User ID: {}", savedUser.getId());
        logger.info("User Email: {}", savedUser.getEmail());

        return mapToUserResponse(savedUser);
    }

    @Override
    public JwtResponse login(LoginRequest loginRequest) {
        logger.info("=== LOGIN ATTEMPT ===");
        logger.info("Email: {}", loginRequest.getEmail());

        try {
            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail().toLowerCase().trim(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            logger.info("Authentication successful for: {}", userDetails.getEmail());

            // Generate tokens
            String jwt = jwtUtils.generateJwtToken(authentication);
            String refreshToken = jwtUtils.generateRefreshToken(userDetails.getId());

            // Update last login
            userRepository.findById(userDetails.getId()).ifPresent(u -> {
                u.setLastLogin(LocalDateTime.now());
                userRepository.save(u);
                logger.info("Updated last login for user: {}", u.getEmail());
            });

            logger.info("=== LOGIN SUCCESSFUL ===");

            return new JwtResponse(
                    jwt,
                    refreshToken,
                    userDetails.getId(),
                    userDetails.getName(),
                    userDetails.getEmail(),
                    userDetails.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toList()),
                    userDetails.getHasBike(),
                    userDetails.getAvatar()
            );

        } catch (BadCredentialsException e) {
            logger.error("Invalid credentials for email: {}", loginRequest.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage(), e);
            throw e;
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .hasBike(user.getHasBike())
                .avatar(user.getAvatar())
                .verified(user.getVerified())
                .rating(user.getRating())
                .totalRides(user.getTotalRides())
                .totalDistance(user.getTotalDistance())
                .totalSaved(user.getTotalSaved())
                .roles(user.getRoles())
                .createdAt(user.getCreatedAt())
                .initials(user.getInitials())
                .build();
    }

    // Other required methods
    @Override public JwtResponse refreshToken(String refreshToken) { return null; }
    @Override public void logout(String token) {}
    @Override public void verifyEmail(String token) {}
    @Override public void forgotPassword(String email) {}
    @Override public void resetPassword(String token, String newPassword) {}
    @Override public void changePassword(String userId, String oldPassword, String newPassword) {}
}