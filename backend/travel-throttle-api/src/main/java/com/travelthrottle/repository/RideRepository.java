package com.travelthrottle.repository;

import com.travelthrottle.model.Ride;
import com.travelthrottle.model.enums.RideStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, String> {

    List<Ride> findByOwnerId(String userId);

    List<Ride> findByStatus(RideStatus status);

    @Query("SELECT r FROM Ride r WHERE r.dateTime >= :now AND r.status = 'UPCOMING' AND r.availableSeats > 0 ORDER BY r.dateTime ASC")
    List<Ride> findUpcomingRides(@Param("now") LocalDateTime now);

    @Query("SELECT DISTINCT r FROM Ride r " +
            "LEFT JOIN RideRequest req ON req.ride = r AND req.user.id = :userId AND req.status = 'APPROVED' " +
            "WHERE r.owner.id = :userId OR req.id IS NOT NULL")
    List<Ride> findAllUserRides(@Param("userId") String userId);

    // FIXED: Search rides with safe parameter handling
    @Query("SELECT r FROM Ride r WHERE " +
            "(:source IS NULL OR :source = '' OR LOWER(r.source) LIKE LOWER(CONCAT('%', :source, '%'))) AND " +
            "(:destination IS NULL OR :destination = '' OR LOWER(r.destination) LIKE LOWER(CONCAT('%', :destination, '%'))) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:minDate IS NULL OR r.dateTime >= :minDate) AND " +
            "(:maxDate IS NULL OR r.dateTime <= :maxDate) AND " +
            "(:minPrice IS NULL OR r.costPerPerson >= :minPrice) AND " +
            "(:maxPrice IS NULL OR r.costPerPerson <= :maxPrice) AND " +
            "(:minSeats IS NULL OR r.availableSeats >= :minSeats)")
    Page<Ride> searchRides(@Param("source") String source,
                           @Param("destination") String destination,
                           @Param("status") RideStatus status,
                           @Param("minDate") LocalDateTime minDate,
                           @Param("maxDate") LocalDateTime maxDate,
                           @Param("minPrice") Double minPrice,
                           @Param("maxPrice") Double maxPrice,
                           @Param("minSeats") Integer minSeats,
                           Pageable pageable);

    @Modifying
    @Query("UPDATE Ride r SET r.status = :status WHERE r.id = :rideId")
    int updateRideStatus(@Param("rideId") String rideId, @Param("status") RideStatus status);

    @Modifying
    @Query("UPDATE Ride r SET r.availableSeats = r.availableSeats - 1 WHERE r.id = :rideId AND r.availableSeats > 0")
    int decrementAvailableSeats(@Param("rideId") String rideId);

    @Modifying
    @Query("UPDATE Ride r SET r.availableSeats = r.availableSeats + 1 WHERE r.id = :rideId AND r.availableSeats < r.totalSeats")
    int incrementAvailableSeats(@Param("rideId") String rideId);
}