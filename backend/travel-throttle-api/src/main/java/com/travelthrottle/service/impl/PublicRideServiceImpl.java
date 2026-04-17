package com.travelthrottle.service.impl;

import com.travelthrottle.dto.response.RideResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import com.travelthrottle.exception.ResourceNotFoundException;
import com.travelthrottle.model.Ride;
import com.travelthrottle.model.User;
import com.travelthrottle.model.enums.RideStatus;
import com.travelthrottle.repository.RideRepository;
import com.travelthrottle.service.PublicRideService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicRideServiceImpl implements PublicRideService {

    private static final Logger logger = LoggerFactory.getLogger(PublicRideServiceImpl.class);
    private final RideRepository rideRepository;

    @Override
    public List<RideResponse> getAllUpcomingRides() {
        logger.info("=== PUBLIC: Getting all upcoming rides ===");

        try {
            List<Ride> allRides = rideRepository.findAll();
            LocalDateTime now = LocalDateTime.now();

            logger.info("Total rides in database: {}", allRides.size());

            // Log all rides for debugging
            for (Ride ride : allRides) {
                logger.info("Ride: ID={}, Source='{}', Dest='{}', Status={}, Seats={}, Date={}",
                        ride.getId(), ride.getSource(), ride.getDestination(),
                        ride.getStatus(), ride.getAvailableSeats(), ride.getDateTime());
            }

            List<RideResponse> upcomingRides = allRides.stream()
                    .filter(ride -> {
                        boolean valid = ride.getStatus() == RideStatus.UPCOMING
                                && ride.getDateTime() != null
                                && ride.getDateTime().isAfter(now)
                                && ride.getAvailableSeats() != null
                                && ride.getAvailableSeats() > 0;
                        if (!valid) {
                            logger.debug("Filtered out ride {}: status={}, date={}, seats={}",
                                    ride.getId(), ride.getStatus(), ride.getDateTime(), ride.getAvailableSeats());
                        }
                        return valid;
                    })
                    .map(this::mapToRideResponse)
                    .filter(response -> response != null)
                    .collect(Collectors.toList());

            logger.info("Found {} upcoming rides", upcomingRides.size());
            return upcomingRides;

        } catch (Exception e) {
            logger.error("Error getting upcoming rides: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<RideResponse> getUpcomingRides() {
        return getAllUpcomingRides();
    }

    @Override
    public List<RideResponse> searchRides(String source, String destination, LocalDate date,
                                          Double maxPrice, Integer minSeats) {
        logger.info("=== PUBLIC: Searching rides ===");
        logger.info("Source: '{}', Destination: '{}', Date: {}, MaxPrice: {}, MinSeats: {}",
                source, destination, date, maxPrice, minSeats);

        try {
            List<Ride> allRides = rideRepository.findAll();
            LocalDateTime now = LocalDateTime.now();

            logger.info("Total rides in database: {}", allRides.size());

            List<RideResponse> results = allRides.stream()
                    .filter(ride -> {
                        // Log each ride as we check
                        logger.debug("Checking ride: ID={}, Source='{}', Dest='{}'",
                                ride.getId(), ride.getSource(), ride.getDestination());
                        return true;
                    })
                    .filter(ride -> ride.getStatus() == RideStatus.UPCOMING)
                    .filter(ride -> ride.getDateTime() != null && ride.getDateTime().isAfter(now))
                    .filter(ride -> ride.getAvailableSeats() != null && ride.getAvailableSeats() > 0)
                    .filter(ride -> {
                        // CRITICAL FIX: Case-insensitive partial match
                        if (source != null && !source.trim().isEmpty()) {
                            String searchSource = source.trim().toLowerCase();
                            String rideSource = ride.getSource() != null ? ride.getSource().toLowerCase() : "";
                            boolean matches = rideSource.contains(searchSource);
                            if (!matches) {
                                logger.debug("Ride {} source '{}' doesn't match '{}'",
                                        ride.getId(), rideSource, searchSource);
                            }
                            return matches;
                        }
                        return true;
                    })
                    .filter(ride -> {
                        // CRITICAL FIX: Case-insensitive partial match
                        if (destination != null && !destination.trim().isEmpty()) {
                            String searchDest = destination.trim().toLowerCase();
                            String rideDest = ride.getDestination() != null ? ride.getDestination().toLowerCase() : "";
                            boolean matches = rideDest.contains(searchDest);
                            if (!matches) {
                                logger.debug("Ride {} destination '{}' doesn't match '{}'",
                                        ride.getId(), rideDest, searchDest);
                            }
                            return matches;
                        }
                        return true;
                    })
                    .filter(ride -> {
                        if (date != null) {
                            boolean matches = ride.getDateTime() != null &&
                                    ride.getDateTime().toLocalDate().equals(date);
                            if (!matches) {
                                logger.debug("Ride {} date {} doesn't match {}",
                                        ride.getId(), ride.getDateTime(), date);
                            }
                            return matches;
                        }
                        return true;
                    })
                    .filter(ride -> {
                        if (maxPrice != null) {
                            boolean matches = ride.getCostPerPerson() != null &&
                                    ride.getCostPerPerson() <= maxPrice;
                            if (!matches) {
                                logger.debug("Ride {} price {} > max {}",
                                        ride.getId(), ride.getCostPerPerson(), maxPrice);
                            }
                            return matches;
                        }
                        return true;
                    })
                    .filter(ride -> {
                        if (minSeats != null) {
                            boolean matches = ride.getAvailableSeats() != null &&
                                    ride.getAvailableSeats() >= minSeats;
                            if (!matches) {
                                logger.debug("Ride {} seats {} < min {}",
                                        ride.getId(), ride.getAvailableSeats(), minSeats);
                            }
                            return matches;
                        }
                        return true;
                    })
                    .map(this::mapToRideResponse)
                    .filter(response -> response != null)
                    .collect(Collectors.toList());

            logger.info("Found {} rides matching criteria", results.size());
            return results;

        } catch (Exception e) {
            logger.error("Error searching rides: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public RideResponse getRideById(String rideId) {
        logger.info("=== PUBLIC: Getting ride by ID: {} ===", rideId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> ResourceNotFoundException.ride(rideId));

        return mapToRideResponse(ride);
    }

    @Override
    public List<RideResponse> filterRides(String source, String destination,
                                          LocalDate fromDate, LocalDate toDate,
                                          Double minPrice, Double maxPrice,
                                          Integer minSeats, Integer maxSeats) {
        logger.info("=== PUBLIC: Filtering rides ===");

        try {
            List<Ride> allRides = rideRepository.findAll();
            LocalDateTime now = LocalDateTime.now();

            return allRides.stream()
                    .filter(ride -> ride.getStatus() == RideStatus.UPCOMING)
                    .filter(ride -> ride.getDateTime() != null && ride.getDateTime().isAfter(now))
                    .filter(ride -> ride.getAvailableSeats() != null && ride.getAvailableSeats() > 0)
                    .filter(ride -> source == null || source.isEmpty() ||
                            (ride.getSource() != null && ride.getSource().toLowerCase().contains(source.toLowerCase())))
                    .filter(ride -> destination == null || destination.isEmpty() ||
                            (ride.getDestination() != null && ride.getDestination().toLowerCase().contains(destination.toLowerCase())))
                    .filter(ride -> fromDate == null ||
                            (ride.getDateTime() != null && !ride.getDateTime().toLocalDate().isBefore(fromDate)))
                    .filter(ride -> toDate == null ||
                            (ride.getDateTime() != null && !ride.getDateTime().toLocalDate().isAfter(toDate)))
                    .filter(ride -> minPrice == null ||
                            (ride.getCostPerPerson() != null && ride.getCostPerPerson() >= minPrice))
                    .filter(ride -> maxPrice == null ||
                            (ride.getCostPerPerson() != null && ride.getCostPerPerson() <= maxPrice))
                    .filter(ride -> minSeats == null ||
                            (ride.getAvailableSeats() != null && ride.getAvailableSeats() >= minSeats))
                    .filter(ride -> maxSeats == null ||
                            (ride.getAvailableSeats() != null && ride.getAvailableSeats() <= maxSeats))
                    .map(this::mapToRideResponse)
                    .filter(response -> response != null)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Error filtering rides: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private RideResponse mapToRideResponse(Ride ride) {
        if (ride == null) return null;

        try {
            UserSummaryResponse.UserSummaryResponseBuilder ownerBuilder = UserSummaryResponse.builder();
            if (ride.getOwner() != null) {
                User owner = ride.getOwner();
                ownerBuilder
                        .id(owner.getId())
                        .name(owner.getName() != null ? owner.getName() : "Unknown")
                        .email(owner.getEmail())
                        .avatar(owner.getAvatar())
                        .rating(owner.getRating() != null ? owner.getRating() : 0.0)
                        .totalRides(owner.getTotalRides() != null ? owner.getTotalRides() : 0)
                        .verified(owner.getVerified() != null ? owner.getVerified() : false)
                        .hasBike(owner.getHasBike() != null ? owner.getHasBike() : false)
                        .initials(owner.getInitials())
                        .phone(null);
            }

            return RideResponse.builder()
                    .id(ride.getId())
                    .source(ride.getSource() != null ? ride.getSource() : "")
                    .destination(ride.getDestination() != null ? ride.getDestination() : "")
                    .dateTime(ride.getDateTime())
                    .availableSeats(ride.getAvailableSeats())
                    .totalSeats(ride.getTotalSeats())
                    .costPerPerson(ride.getCostPerPerson())
                    .distance(ride.getDistance())
                    .duration(ride.getDuration())
                    .description(ride.getDescription())
                    .allowFemaleOnly(ride.getAllowFemaleOnly())
                    .status(ride.getStatus())
                    .createdAt(ride.getCreatedAt())
                    .owner(ownerBuilder.build())
                    .isFull(ride.isFull())
                    .canJoin(ride.canJoin())
                    .build();

        } catch (Exception e) {
            logger.error("Error mapping ride {}: {}", ride.getId(), e.getMessage());
            return null;
        }
    }
}