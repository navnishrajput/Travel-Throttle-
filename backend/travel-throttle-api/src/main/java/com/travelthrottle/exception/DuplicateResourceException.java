package com.travelthrottle.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String fieldName, String fieldValue) {
        super(String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public static DuplicateResourceException emailAlreadyExists(String email) {
        return new DuplicateResourceException("User", "email", email);
    }

    public static DuplicateResourceException phoneAlreadyExists(String phone) {
        return new DuplicateResourceException("User", "phone", phone);
    }

    public static DuplicateResourceException registrationNumberExists(String regNumber) {
        return new DuplicateResourceException("Bike", "registration number", regNumber);
    }

    public static DuplicateResourceException requestAlreadyExists(String rideId, String userId) {
        return new DuplicateResourceException(String.format("Request already exists for ride %s by user %s", rideId, userId));
    }

    public static DuplicateResourceException reviewAlreadyExists(String rideId, String reviewerId) {
        return new DuplicateResourceException(String.format("Review already exists for ride %s by user %s", rideId, reviewerId));
    }
}