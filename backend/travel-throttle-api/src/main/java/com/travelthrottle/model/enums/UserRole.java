package com.travelthrottle.model.enums;

/**
 * User Role Enum
 * Defines user roles for authorization
 */
public enum UserRole {
    ROLE_USER("User"),
    ROLE_ADMIN("Administrator");

    private final String label;

    UserRole(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static UserRole fromString(String role) {
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ROLE_USER;
        }
    }
}