package com.travelthrottle.model.enums;

public enum GroupRideStatus {
    UPCOMING("Upcoming", "primary"),
    ONGOING("Ongoing", "success"),
    COMPLETED("Completed", "default"),
    CANCELLED("Cancelled", "error");

    private final String label;
    private final String color;

    GroupRideStatus(String label, String color) {
        this.label = label;
        this.color = color;
    }

    public String getLabel() { return label; }
    public String getColor() { return color; }
}