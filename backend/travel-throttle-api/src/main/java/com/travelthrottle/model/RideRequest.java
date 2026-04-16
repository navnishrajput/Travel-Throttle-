package com.travelthrottle.model;

import com.travelthrottle.model.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ride_requests", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"ride_id", "user_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    private String message;

    @Builder.Default
    private Integer seatsRequested = 1;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime respondedAt;

    @ManyToOne(fetch = FetchType.EAGER)  // CHANGE TO EAGER
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;

    @ManyToOne(fetch = FetchType.EAGER)  // CHANGE TO EAGER
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public boolean isPending() {
        return status == RequestStatus.PENDING;
    }

    public boolean isApproved() {
        return status == RequestStatus.APPROVED;
    }

    public boolean isRejected() {
        return status == RequestStatus.REJECTED;
    }

    public void approve() {
        this.status = RequestStatus.APPROVED;
        this.respondedAt = LocalDateTime.now();
    }

    public void reject() {
        this.status = RequestStatus.REJECTED;
        this.respondedAt = LocalDateTime.now();
    }
}