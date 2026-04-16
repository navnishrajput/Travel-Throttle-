package com.travelthrottle.websocket;

import com.travelthrottle.security.jwt.JwtUtils;
import com.travelthrottle.security.services.UserDetailsServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");

            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);

                if (authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);

                    try {
                        if (jwtUtils.validateJwtToken(token)) {
                            String userId = jwtUtils.getUserIdFromJwtToken(token);
                            UserDetails userDetails = userDetailsService.loadUserById(userId);

                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails, null, userDetails.getAuthorities());

                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            accessor.setUser(authentication);

                            logger.debug("WebSocket authenticated for user: {}", userId);
                        } else {
                            logger.warn("Invalid JWT token in WebSocket connection");
                            return null;
                        }
                    } catch (Exception e) {
                        logger.error("WebSocket authentication failed: {}", e.getMessage());
                        return null;
                    }
                } else {
                    logger.warn("Missing Bearer token in WebSocket connection");
                    return null;
                }
            } else {
                logger.warn("Missing Authorization header in WebSocket connection");
                return null;
            }
        }

        return message;
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        // Clean up if needed
    }
}