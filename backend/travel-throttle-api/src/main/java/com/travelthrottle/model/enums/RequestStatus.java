package com.travelthrottle.model.enums;

/**
 * Ride Request Status Enum
 * Represents the status of a ride join request
 */
public enum RequestStatus {
    PENDING("Pending", "warning"),
    APPROVED("Approved", "success"),
    REJECTED("Rejected", "error"),
    CANCELLED("Cancelled", "default");

    private final String label;
    private final String color;

    RequestStatus(String label, String color) {
        this.label = label;
        this.color = color;
    }

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }

    public static RequestStatus fromString(String status) {
        try {
            return RequestStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PENDING;
        }
    }
}