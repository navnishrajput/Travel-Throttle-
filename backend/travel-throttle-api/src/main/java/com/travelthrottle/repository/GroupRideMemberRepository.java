package com.travelthrottle.repository;

import com.travelthrottle.model.GroupRideMember;
import com.travelthrottle.model.GroupRideMember.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRideMemberRepository extends JpaRepository<GroupRideMember, String> {

    List<GroupRideMember> findByGroupRideId(String groupRideId);

    List<GroupRideMember> findByUserId(String userId);

    List<GroupRideMember> findByGroupRideIdAndStatus(String groupRideId, MemberStatus status);

    Optional<GroupRideMember> findByGroupRideIdAndUserId(String groupRideId, String userId);

    boolean existsByGroupRideIdAndUserId(String groupRideId, String userId);
}