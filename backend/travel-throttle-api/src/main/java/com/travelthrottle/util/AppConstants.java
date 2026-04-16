package com.travelthrottle.util;

/**
 * Application Constants
 * Centralized constants for the entire application
 */
public final class AppConstants {

    private AppConstants() {
        // Private constructor to prevent instantiation
    }

    // API Constants
    public static final String API_BASE_PATH = "/api/v1";
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String MAX_PAGE_SIZE = "50";
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    // Ride Constants
    public static final int MAX_SEATS_PER_RIDE = 4;
    public static final int MIN_SEATS_PER_RIDE = 1;
    public static final double MAX_RIDE_COST = 10000.0;
    public static final double MIN_RIDE_COST = 0.0;

    // Bike Constants
    public static final int MAX_BIKES_PER_USER = 5;

    // Message Constants
    public static final int MAX_MESSAGE_LENGTH = 500;
    public static final int MAX_CHAT_HISTORY_DAYS = 30;

    // Validation Constants
    public static final int MIN_PASSWORD_LENGTH = 8;
    public static final int MAX_NAME_LENGTH = 50;
    public static final int MIN_NAME_LENGTH = 2;
    public static final String PHONE_REGEX = "^[0-9]{10}$";
    public static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@(.+)$";

    // Security Constants
    public static final String TOKEN_TYPE = "Bearer ";
    public static final String AUTHORIZATION_HEADER = "Authorization";

    // Notification Constants
    public static final String RIDE_REQUEST_TITLE = "New Join Request";
    public static final String RIDE_APPROVED_TITLE = "Request Approved";
    public static final String RIDE_REJECTED_TITLE = "Request Rejected";
    public static final String NEW_MESSAGE_TITLE = "New Message";

    // File Upload Constants
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"};

    // Cache Constants
    public static final String USER_CACHE = "users";
    public static final String RIDE_CACHE = "rides";
    public static final long CACHE_TTL_SECONDS = 300; // 5 minutes
}