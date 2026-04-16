package com.travelthrottle.repository;

import com.travelthrottle.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Basic queries
    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Boolean existsByEmail(String email);

    Boolean existsByPhone(String phone);

    // Search queries
    List<User> findByNameContainingIgnoreCase(String name);

    List<User> findByVerified(Boolean verified);

    List<User> findByHasBike(Boolean hasBike);

    // Rating queries
    List<User> findByRatingGreaterThanEqual(Double minRating);

    @Query("SELECT u FROM User u WHERE u.rating >= :minRating ORDER BY u.rating DESC")
    Page<User> findTopRatedUsers(@Param("minRating") Double minRating, Pageable pageable);

    // Ride count queries
    @Query("SELECT u FROM User u WHERE u.totalRides >= :minRides ORDER BY u.totalRides DESC")
    List<User> findExperiencedRiders(@Param("minRides") Integer minRides);

    // Active users
    @Query("SELECT u FROM User u WHERE u.lastLogin >= :since")
    List<User> findActiveUsers(@Param("since") LocalDateTime since);

    // Admin queries
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = 'ROLE_ADMIN'")
    List<User> findAllAdmins();

    // Update operations
    @Modifying
    @Query("UPDATE User u SET u.verified = true WHERE u.id = :userId")
    int verifyUser(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE User u SET u.rating = :rating, u.totalRides = :totalRides WHERE u.id = :userId")
    int updateUserStats(@Param("userId") String userId,
                        @Param("rating") Double rating,
                        @Param("totalRides") Integer totalRides);

    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.id = :userId")
    int updateLastLogin(@Param("userId") String userId, @Param("lastLogin") LocalDateTime lastLogin);

    // Statistics
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    Long countNewUsers(@Param("since") LocalDateTime since);

    @Query("SELECT AVG(u.rating) FROM User u WHERE u.totalRides > 0")
    Double getAverageRating();

    // Find users with bikes
    @Query("SELECT u FROM User u WHERE u.hasBike = true AND SIZE(u.bikes) > 0")
    List<User> findUsersWithBikes();
}