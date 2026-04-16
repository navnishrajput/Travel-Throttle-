package com.travelthrottle.repository;

import com.travelthrottle.model.Bike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BikeRepository extends JpaRepository<Bike, String> {

    // NATIVE QUERY - FIXED
    @Query(value = "SELECT * FROM bikes WHERE user_id = ?1 ORDER BY created_at DESC", nativeQuery = true)
    List<Bike> findBikesByUserIdNative(String userId);

    // Alternative with named parameter
    @Query(value = "SELECT * FROM bikes WHERE user_id = :userId ORDER BY created_at DESC", nativeQuery = true)
    List<Bike> findBikesByUserIdNativeNamed(@Param("userId") String userId);

    // Standard JPA method
    List<Bike> findByUserId(String userId);

    @Query("SELECT COUNT(b) FROM Bike b WHERE b.user.id = :userId")
    Long countBikesByUser(@Param("userId") String userId);

    boolean existsByRegistrationNumber(String registrationNumber);

    @Query("SELECT b FROM Bike b WHERE b.user.id = :userId AND b.verified = true")
    List<Bike> findAvailableBikesForUser(@Param("userId") String userId);
}