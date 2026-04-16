package com.travelthrottle.model.enums;

/**
 * Ride Status Enum
 * Represents the current state of a ride
 */
public enum RideStatus {
    UPCOMING("Upcoming", "primary"),
    ONGOING("Ongoing", "success"),
    COMPLETED("Completed", "default"),
    CANCELLED("Cancelled", "error");

    private final String label;
    private final String color;

    RideStatus(String label, String color) {
        this.label = label;
        this.color = color;
    }

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }

    public static RideStatus fromString(String status) {
        try {
            return RideStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return UPCOMING;
        }
    }
}