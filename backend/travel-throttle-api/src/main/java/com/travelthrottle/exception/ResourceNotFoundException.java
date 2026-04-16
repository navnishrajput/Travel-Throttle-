package com.travelthrottle.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public ResourceNotFoundException(String resourceName, String fieldName, String fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public static ResourceNotFoundException user(String userId) {
        return new ResourceNotFoundException("User", "id", userId);
    }

    public static ResourceNotFoundException userByEmail(String email) {
        return new ResourceNotFoundException("User", "email", email);
    }

    public static ResourceNotFoundException ride(String rideId) {
        return new ResourceNotFoundException("Ride", "id", rideId);
    }

    public static ResourceNotFoundException bike(String bikeId) {
        return new ResourceNotFoundException("Bike", "id", bikeId);
    }

    public static ResourceNotFoundException request(String requestId) {
        return new ResourceNotFoundException("Ride Request", "id", requestId);
    }

    public static ResourceNotFoundException message(String messageId) {
        return new ResourceNotFoundException("Message", "id", messageId);
    }

    public static ResourceNotFoundException review(String reviewId) {
        return new ResourceNotFoundException("Review", "id", reviewId);
    }

    public static ResourceNotFoundException notification(String notificationId) {
        return new ResourceNotFoundException("Notification", "id", notificationId);
    }
}