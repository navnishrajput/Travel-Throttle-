package com.travelthrottle.controller;

import com.travelthrottle.dto.request.MessageRequest;
import com.travelthrottle.dto.response.ApiResponse;
import com.travelthrottle.dto.response.MessageResponse;
import com.travelthrottle.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Chat and messaging endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;

    @PostMapping("/messages")
    @Operation(summary = "Send message")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(@Valid @RequestBody MessageRequest request) {
        logger.info("POST /chat/messages - rideId: {}", request.getRideId());
        try {
            MessageResponse response = chatService.sendMessage(request);
            return ResponseEntity.ok(ApiResponse.success("Message sent", response));
        } catch (Exception e) {
            logger.error("Error sending message: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/rides/{rideId}/messages")
    @Operation(summary = "Get ride messages")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getRideMessages(@PathVariable String rideId) {
        logger.info("GET /chat/rides/{}/messages", rideId);
        try {
            List<MessageResponse> messages = chatService.getRideMessages(rideId);
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            logger.error("Error fetching messages: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    // WebSocket endpoint
    @Controller
    public static class WebSocketChatController {

        private final ChatService chatService;

        public WebSocketChatController(ChatService chatService) {
            this.chatService = chatService;
        }

        @MessageMapping("/chat.sendMessage")
        public void sendMessage(@Payload MessageRequest request) {
            chatService.sendMessage(request);
        }
    }
}