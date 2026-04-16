package com.travelthrottle.util;

import java.util.regex.Pattern;

/**
 * Validation utility functions
 */
public final class ValidationUtils {

    private ValidationUtils() {
        // Private constructor to prevent instantiation
    }

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[0-9]{10}$");

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$");

    private static final Pattern REGISTRATION_NUMBER_PATTERN =
            Pattern.compile("^[A-Z]{2}\\s?\\d{2}\\s?[A-Z]{1,2}\\s?\\d{4}$");

    private static final Pattern USERNAME_PATTERN =
            Pattern.compile("^[a-zA-Z0-9_]{3,20}$");

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    public static boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }

    public static boolean isValidRegistrationNumber(String regNumber) {
        return regNumber != null && REGISTRATION_NUMBER_PATTERN.matcher(regNumber).matches();
    }

    public static boolean isValidUsername(String username) {
        return username != null && USERNAME_PATTERN.matcher(username).matches();
    }

    public static boolean isValidRating(Integer rating) {
        return rating != null && rating >= 1 && rating <= 5;
    }

    public static boolean isValidSeats(Integer seats) {
        return seats != null && seats >= 1 && seats <= 4;
    }

    public static boolean isValidCost(Double cost) {
        return cost != null && cost >= 0 && cost <= 10000;
    }

    public static boolean isValidYear(Integer year) {
        int currentYear = java.time.Year.now().getValue();
        return year != null && year >= 1980 && year <= currentYear + 1;
    }

    public static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public static boolean isWithinLength(String value, int min, int max) {
        return value != null && value.length() >= min && value.length() <= max;
    }

    public static String sanitizeInput(String input) {
        if (input == null) return null;
        return input.replaceAll("[<>\"']", "").trim();
    }

    public static String formatPhoneNumber(String phone) {
        if (phone == null || phone.length() != 10) return phone;
        return String.format("+91 %s %s",
                phone.substring(0, 5),
                phone.substring(5));
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];

        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return phone;
        return phone.substring(0, 2) + "******" + phone.substring(phone.length() - 2);
    }
}