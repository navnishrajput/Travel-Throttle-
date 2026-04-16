package com.travelthrottle.repository;

import com.travelthrottle.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    @Query(value = "SELECT * FROM messages WHERE ride_id = :rideId ORDER BY timestamp ASC", nativeQuery = true)
    List<Message> findByRideIdOrderByTimestampAsc(@Param("rideId") String rideId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.ride.id = :rideId AND m.sender.id != :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("rideId") String rideId, @Param("userId") String userId);
}