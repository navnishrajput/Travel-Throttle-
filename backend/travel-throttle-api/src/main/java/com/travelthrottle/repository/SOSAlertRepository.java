package com.travelthrottle.repository;

import com.travelthrottle.model.SOSAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SOSAlertRepository extends JpaRepository<SOSAlert, String> {

    List<SOSAlert> findByUserIdOrderByCreatedAtDesc(String userId);

    List<SOSAlert> findByRideId(String rideId);

    @Query("SELECT s FROM SOSAlert s WHERE s.user.id = :userId AND s.createdAt > CURRENT_DATE")
    List<SOSAlert> findRecentAlertsByUser(@Param("userId") String userId);
}