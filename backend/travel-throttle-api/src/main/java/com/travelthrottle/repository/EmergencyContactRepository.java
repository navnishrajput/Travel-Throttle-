package com.travelthrottle.repository;

import com.travelthrottle.model.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, String> {

    List<EmergencyContact> findByUserId(String userId);

    @Query("SELECT ec FROM EmergencyContact ec WHERE ec.user.id = :userId AND ec.isPrimary = true")
    List<EmergencyContact> findPrimaryContacts(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM EmergencyContact ec WHERE ec.user.id = :userId AND ec.id = :contactId")
    void deleteByUserIdAndId(@Param("userId") String userId, @Param("contactId") String contactId);

    @Query("SELECT COUNT(ec) FROM EmergencyContact ec WHERE ec.user.id = :userId")
    long countByUserId(@Param("userId") String userId);
}