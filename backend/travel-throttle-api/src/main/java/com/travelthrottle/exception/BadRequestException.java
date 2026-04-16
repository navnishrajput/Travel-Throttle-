package com.travelthrottle.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }

    public static BadRequestException invalidRequest(String reason) {
        return new BadRequestException("Invalid request: " + reason);
    }

    public static BadRequestException rideFull(String rideId) {
        return new BadRequestException("Ride is already full");
    }

    public static BadRequestException rideExpired(String rideId) {
        return new BadRequestException("Ride has already departed or expired");
    }

    public static BadRequestException alreadyRequested(String rideId) {
        return new BadRequestException("You have already requested to join this ride");
    }

    public static BadRequestException cannotReviewOwnRide() {
        return new BadRequestException("You cannot review yourself");
    }

    public static BadRequestException invalidDateRange() {
        return new BadRequestException("End date must be after start date");
    }

    public static BadRequestException insufficientSeats(int requested, int available) {
        return new BadRequestException(String.format("Requested %d seats but only %d available", requested, available));
    }
}