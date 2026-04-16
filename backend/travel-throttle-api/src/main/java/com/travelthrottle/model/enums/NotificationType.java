package com.travelthrottle.model.enums;

public enum NotificationType {
    RIDE_REQUEST,
    RIDE_APPROVED,
    RIDE_REJECTED,
    RIDE_CANCELLED,
    RIDE_COMPLETED,
    NEW_MESSAGE,
    NEW_REVIEW,
    SYSTEM_ALERT,
    PAYMENT_RECEIVED;

    public String getIcon() {
        switch (this) {
            case RIDE_REQUEST: return "user-plus";
            case RIDE_APPROVED: return "check-circle";
            case RIDE_REJECTED: return "x-circle";
            case RIDE_CANCELLED: return "calendar-x";
            case RIDE_COMPLETED: return "flag-checkered";
            case NEW_MESSAGE: return "message-circle";
            case NEW_REVIEW: return "star";
            case SYSTEM_ALERT: return "alert-circle";
            case PAYMENT_RECEIVED: return "dollar-sign";
            default: return "bell";
        }
    }
}