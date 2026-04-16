package com.travelthrottle.service;

import com.travelthrottle.dto.request.MessageRequest;
import com.travelthrottle.dto.response.MessageResponse;
import com.travelthrottle.model.User;

import java.util.List;

public interface ChatService {

    MessageResponse sendMessage(MessageRequest request);

    List<MessageResponse> getRideMessages(String rideId);

    MessageResponse sendSystemMessage(String rideId, String content);

    void sendUserJoinedMessage(String rideId, User user);

    void sendUserLeftMessage(String rideId, User user);

    void sendRideStatusMessage(String rideId, String status);
}