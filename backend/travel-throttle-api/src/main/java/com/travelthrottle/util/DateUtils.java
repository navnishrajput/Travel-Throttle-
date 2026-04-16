package com.travelthrottle.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Date utility functions
 */
public final class DateUtils {

    private DateUtils() {
        // Private constructor to prevent instantiation
    }

    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    public static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    public static final DateTimeFormatter READABLE_DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    public static final DateTimeFormatter READABLE_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    public static String formatDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_FORMATTER) : "";
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : "";
    }

    public static String formatTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(TIME_FORMATTER) : "";
    }

    public static String formatReadableDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(READABLE_DATE_FORMATTER) : "";
    }

    public static String formatReadableDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(READABLE_DATE_TIME_FORMATTER) : "";
    }

    public static String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";

        LocalDateTime now = LocalDateTime.now();
        long seconds = ChronoUnit.SECONDS.between(dateTime, now);
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);

        if (seconds < 60) return "just now";
        if (minutes == 1) return "1 minute ago";
        if (minutes < 60) return minutes + " minutes ago";
        if (hours == 1) return "1 hour ago";
        if (hours < 24) return hours + " hours ago";
        if (days == 1) return "yesterday";
        if (days < 7) return days + " days ago";
        if (days < 30) return (days / 7) + " weeks ago";
        if (days < 365) return (days / 30) + " months ago";
        return (days / 365) + " years ago";
    }

    public static String getDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return "";

        long minutes = ChronoUnit.MINUTES.between(start, end);
        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;

        if (hours == 0) {
            return remainingMinutes + " min";
        } else if (remainingMinutes == 0) {
            return hours + " hr";
        } else {
            return hours + " hr " + remainingMinutes + " min";
        }
    }

    public static boolean isExpired(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(LocalDateTime.now());
    }

    public static boolean isUpcoming(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isAfter(LocalDateTime.now());
    }

    public static LocalDateTime parseDate(String dateStr) {
        try {
            return LocalDateTime.parse(dateStr, DATE_TIME_FORMATTER);
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(dateStr + "T00:00:00");
            } catch (Exception ex) {
                return null;
            }
        }
    }

    public static LocalDateTime getStartOfDay(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate().atStartOfDay() : null;
    }

    public static LocalDateTime getEndOfDay(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate().atTime(23, 59, 59) : null;
    }
}