package com.travelthrottle.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }

    public static UnauthorizedException invalidToken() {
        return new UnauthorizedException("Invalid or expired token");
    }

    public static UnauthorizedException missingToken() {
        return new UnauthorizedException("Authentication token is missing");
    }

    public static UnauthorizedException notOwner() {
        return new UnauthorizedException("You are not the owner of this resource");
    }

    public static UnauthorizedException notParticipant() {
        return new UnauthorizedException("You are not a participant in this ride");
    }

    public static UnauthorizedException insufficientPermissions() {
        return new UnauthorizedException("Insufficient permissions to perform this action");
    }
}