package com.travelthrottle.security.oauth2;

import com.travelthrottle.model.User;
import com.travelthrottle.model.enums.UserRole;
import com.travelthrottle.repository.UserRepository;
import com.travelthrottle.security.jwt.JwtUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Autowired
    public OAuth2AuthenticationSuccessHandler(
            JwtUtils jwtUtils,
            UserRepository userRepository,
            @Lazy PasswordEncoder passwordEncoder) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        logger.info("=== OAUTH2 AUTHENTICATION SUCCESS ===");

        try {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauth2User = oauthToken.getPrincipal();

            Map<String, Object> attributes = oauth2User.getAttributes();

            String email = (String) attributes.get("email");
            String name = (String) attributes.get("name");
            String picture = (String) attributes.get("picture");
            String googleId = (String) attributes.get("sub");

            logger.info("OAuth2 User: {} ({})", name, email);

            // Find or create user
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createNewUser(email, name, picture, googleId));

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Generate JWT token
            String jwt = jwtUtils.generateJwtTokenFromUserId(user.getId());

            logger.info("JWT token generated for user: {}", user.getEmail());

            // Redirect to frontend with token
            String frontendUrl = allowedOrigins.split(",")[0].trim();
            String redirectUrl = frontendUrl + "/oauth2/redirect?token=" + jwt +
                    "&id=" + user.getId() +
                    "&name=" + user.getName() +
                    "&email=" + user.getEmail() +
                    "&hasBike=" + user.getHasBike() +
                    "&avatar=" + (user.getAvatar() != null ? user.getAvatar() : "");

            logger.info("Redirecting to: {}", redirectUrl);

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } catch (Exception e) {
            logger.error("OAuth2 authentication error: {}", e.getMessage(), e);
            getRedirectStrategy().sendRedirect(request, response, allowedOrigins.split(",")[0] + "/login?error=oauth2");
        }
    }

    private User createNewUser(String email, String name, String picture, String googleId) {
        logger.info("Creating new user from OAuth2: {}", email);

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setName(name != null ? name : email.split("@")[0]);
        user.setPhone("");
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setHasBike(false);
        user.setAvatar(picture);
        user.setVerified(true);
        user.setRating(0.0);
        user.setTotalRides(0);
        user.setTotalDistance(0);
        user.setTotalSaved(0.0);
        user.setCreatedAt(LocalDateTime.now());
        user.setRoles(Set.of(UserRole.ROLE_USER));

        return userRepository.save(user);
    }
}