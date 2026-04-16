package com.travelthrottle.service;

import com.travelthrottle.dto.request.BikeRequest;
import com.travelthrottle.dto.response.BikeResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BikeService {

    BikeResponse addBike(BikeRequest request);

    BikeResponse updateBike(String bikeId, BikeRequest request);

    void deleteBike(String bikeId);

    BikeResponse getBikeById(String bikeId);

    List<BikeResponse> getMyBikes();

    List<BikeResponse> getUserBikes(String userId);

    List<BikeResponse> getAvailableBikesForUser(String userId);

    BikeResponse uploadBikeImage(String bikeId, MultipartFile file);

    void verifyBike(String bikeId);

    boolean isBikeAvailable(String bikeId);

    Long countUserBikes(String userId);

    boolean existsByRegistrationNumber(String registrationNumber);
}