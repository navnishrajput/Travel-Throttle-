package com.travelthrottle.model;

import com.travelthrottle.model.enums.RideStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rides")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false)
    private Integer availableSeats;

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Double costPerPerson;

    private Double distance;
    private String duration;

    @Column(length = 1000)
    private String description;

    @Builder.Default
    private Boolean allowFemaleOnly = false;

    private Double sourceLat;
    private Double sourceLng;
    private Double destLat;
    private Double destLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RideStatus status = RideStatus.UPCOMING;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bike_id", nullable = false)
    private Bike bike;

    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<RideRequest> requests = new HashSet<>();

    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Message> messages = new HashSet<>();

    public boolean isFull() {
        return availableSeats != null && availableSeats <= 0;
    }

    public boolean canJoin() {
        return status == RideStatus.UPCOMING && availableSeats != null && availableSeats > 0;
    }

    public boolean isOwner(String userId) {
        return owner != null && owner.getId() != null && owner.getId().equals(userId);
    }

    // Helper method to get approved requests count
    public int getApprovedSeatsCount() {
        if (requests == null || requests.isEmpty()) return 0;
        return requests.stream()
                .filter(req -> req.getStatus() == com.travelthrottle.model.enums.RequestStatus.APPROVED)
                .mapToInt(req -> req.getSeatsRequested() != null ? req.getSeatsRequested() : 1)
                .sum();
    }

    // Calculate available seats based on total and approved requests
    public int calculateAvailableSeats() {
        int approvedSeats = getApprovedSeatsCount();
        return totalSeats - approvedSeats;
    }
}