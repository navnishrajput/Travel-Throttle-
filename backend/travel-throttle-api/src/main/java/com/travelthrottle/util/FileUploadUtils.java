package com.travelthrottle.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * File upload utility functions
 */
public final class FileUploadUtils {

    private FileUploadUtils() {
        // Private constructor to prevent instantiation
    }

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
    );

    public static String saveFile(MultipartFile file, String directory) throws IOException {
        validateFile(file);

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(directory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        return filename;
    }

    public static void deleteFile(String filename, String directory) throws IOException {
        if (filename == null || filename.isEmpty()) {
            return;
        }

        Path filePath = Paths.get(directory, filename);
        Files.deleteIfExists(filePath);
    }

    public static byte[] readFile(String filename, String directory) throws IOException {
        Path filePath = Paths.get(directory, filename);
        return Files.readAllBytes(filePath);
    }

    public static boolean fileExists(String filename, String directory) {
        if (filename == null || filename.isEmpty()) {
            return false;
        }
        return Files.exists(Paths.get(directory, filename));
    }

    private static void validateFile(MultipartFile file) {
        // Check if file is empty
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: " + ALLOWED_IMAGE_TYPES);
        }

        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = getFileExtension(originalFilename).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new IllegalArgumentException("Invalid file extension. Allowed: " + ALLOWED_EXTENSIONS);
            }
        }
    }

    private static String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    public static String getFileUrl(String filename, String baseUrl) {
        if (filename == null || filename.isEmpty()) {
            return null;
        }
        return baseUrl + "/" + filename;
    }

    public static String getContentType(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return switch (extension) {
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            case ".webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }
}