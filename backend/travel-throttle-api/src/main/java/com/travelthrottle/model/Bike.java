package com.travelthrottle.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "bikes", uniqueConstraints = {
        @UniqueConstraint(columnNames = "registration_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bike {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "registration_number", nullable = false, unique = true, length = 20)
    private String registrationNumber;

    @Column(nullable = false, length = 30)
    private String color;

    private Integer year;

    @Column(length = 20)
    private String mileage;

    @Builder.Default
    private Integer capacity = 2;

    @Column(length = 500)
    private String imageUrl;

    @Builder.Default
    private Boolean verified = false;

    @Column(length = 500)
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "bike", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Ride> rides = new HashSet<>();

    // Helper methods
    public boolean isOwnedBy(String userId) {
        return user != null && user.getId().equals(userId);
    }

    public String getDisplayName() {
        return String.format("%s (%s) - %s", model, color, registrationNumber);
    }

    public Long getTotalRides() {
        return rides != null ? (long) rides.size() : 0L;
    }

    public Double getTotalDistance() {
        if (rides == null) return 0.0;
        return rides.stream()
                .filter(ride -> ride.getDistance() != null)
                .mapToDouble(Ride::getDistance)
                .sum();
    }
}