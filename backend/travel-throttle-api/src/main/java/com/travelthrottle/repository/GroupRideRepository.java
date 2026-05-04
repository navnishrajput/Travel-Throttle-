package com.travelthrottle.repository;

import com.travelthrottle.model.GroupRide;
import com.travelthrottle.model.enums.GroupRideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GroupRideRepository extends JpaRepository<GroupRide, String> {

    List<GroupRide> findByLeadRiderId(String userId);

    List<GroupRide> findByStatus(GroupRideStatus status);

    @Query("SELECT gr FROM GroupRide gr WHERE gr.status = 'UPCOMING' AND gr.dateTime > :now AND gr.isPublic = true ORDER BY gr.dateTime ASC")
    List<GroupRide> findUpcomingPublicGroupRides(@Param("now") LocalDateTime now);

    @Query("SELECT DISTINCT gr FROM GroupRide gr " +
            "LEFT JOIN GroupRideMember m ON m.groupRide = gr AND m.user.id = :userId AND m.status = 'APPROVED' " +
            "WHERE gr.leadRider.id = :userId OR m.id IS NOT NULL")
    List<GroupRide> findAllUserGroupRides(@Param("userId") String userId);
}