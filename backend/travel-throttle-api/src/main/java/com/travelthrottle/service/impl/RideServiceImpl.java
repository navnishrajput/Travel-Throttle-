package com.travelthrottle.service.impl;

import com.travelthrottle.dto.request.CreateRideRequest;
import com.travelthrottle.dto.request.UpdateRideRequest;
import com.travelthrottle.dto.response.RideResponse;
import com.travelthrottle.dto.response.RideSummaryResponse;
import com.travelthrottle.dto.response.UserSummaryResponse;
import com.travelthrottle.exception.BadRequestException;
import com.travelthrottle.exception.ResourceNotFoundException;
import com.travelthrottle.exception.UnauthorizedException;
import com.travelthrottle.model.Bike;
import com.travelthrottle.model.Message;
import com.travelthrottle.model.Notification;
import com.travelthrottle.model.Review;
import com.travelthrottle.model.Ride;
import com.travelthrottle.model.RideRequest;
import com.travelthrottle.model.User;
import com.travelthrottle.model.enums.RideStatus;
import com.travelthrottle.repository.BikeRepository;
import com.travelthrottle.repository.MessageRepository;
import com.travelthrottle.repository.NotificationRepository;
import com.travelthrottle.repository.ReviewRepository;
import com.travelthrottle.repository.RideRepository;
import com.travelthrottle.repository.RideRequestRepository;
import com.travelthrottle.repository.UserRepository;
import com.travelthrottle.security.services.UserDetailsImpl;
import com.travelthrottle.service.RideService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideServiceImpl implements RideService {

    private static final Logger logger = LoggerFactory.getLogger(RideServiceImpl.class);

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final BikeRepository bikeRepository;
    private final RideRequestRepository rideRequestRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final ReviewRepository reviewRepository;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new UnauthorizedException("User not authenticated");
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @Override
    @Transactional
    public RideResponse createRide(CreateRideRequest request) {
        logger.info("=== CREATE RIDE SERVICE ===");
        logger.info("Source: {}, Destination: {}", request.getSource(), request.getDestination());
        logger.info("Total Seats: {}, Available Seats: {}", request.getTotalSeats(), request.getAvailableSeats());

        String userId = getCurrentUserId();
        logger.info("Current User ID: {}", userId);

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", userId);
                    return ResourceNotFoundException.user(userId);
                });

        logger.info("Owner found: {} ({})", owner.getName(), owner.getEmail());

        Bike bike = bikeRepository.findById(request.getBikeId())
                .orElseThrow(() -> {
                    logger.error("Bike not found: {}", request.getBikeId());
                    return ResourceNotFoundException.bike(request.getBikeId());
                });

        logger.info("Bike found: {} ({})", bike.getModel(), bike.getRegistrationNumber());

        if (!bike.getUser().getId().equals(owner.getId())) {
            logger.error("Bike {} does not belong to user {}", bike.getId(), userId);
            throw new UnauthorizedException("Bike does not belong to you");
        }

        // Validate date is in the future
        if (request.getDateTime().isBefore(LocalDateTime.now())) {
            logger.error("Ride date is in the past: {}", request.getDateTime());
            throw new BadRequestException("Ride date must be in the future");
        }

        // CRITICAL FIX: Ensure availableSeats is set correctly
        int totalSeats = request.getTotalSeats() != null ? request.getTotalSeats() : 4;
        int availableSeats = request.getAvailableSeats() != null ? request.getAvailableSeats() : totalSeats;

        if (availableSeats > totalSeats) {
            logger.error("Available seats ({}) > Total seats ({})", availableSeats, totalSeats);
            throw new BadRequestException("Available seats cannot exceed total seats");
        }

        logger.info("Creating ride with totalSeats: {}, availableSeats: {}", totalSeats, availableSeats);

        Ride ride = Ride.builder()
                .source(request.getSource().trim())
                .destination(request.getDestination().trim())
                .dateTime(request.getDateTime())
                .availableSeats(availableSeats)
                .totalSeats(totalSeats)
                .costPerPerson(request.getCostPerPerson())
                .distance(request.getDistance())
                .duration(request.getDuration())
                .description(request.getDescription())
                .allowFemaleOnly(request.getAllowFemaleOnly() != null ? request.getAllowFemaleOnly() : false)
                .owner(owner)
                .bike(bike)
                .status(RideStatus.UPCOMING)
                .build();

        logger.info("Saving ride to database...");
        Ride savedRide = rideRepository.saveAndFlush(ride);
        logger.info("=== RIDE SAVED SUCCESSFULLY ===");
        logger.info("Ride ID: {}", savedRide.getId());
        logger.info("Total Seats: {}", savedRide.getTotalSeats());
        logger.info("Available Seats: {}", savedRide.getAvailableSeats());
        logger.info("Ride Status: {}", savedRide.getStatus());
        logger.info("Ride Owner: {}", savedRide.getOwner().getName());

        return mapToRideResponse(savedRide);
    }

    @Override
    @Transactional
    public RideResponse updateRide(String rideId, UpdateRideRequest request) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> ResourceNotFoundException.ride(rideId));

        String userId = getCurrentUserId();
        if (!ride.getOwner().getId().equals(userId) && !isAdmin()) {
            throw new UnauthorizedException("You don't have permission to update this ride");
        }

        if (ride.getStatus() != RideStatus.UPCOMING) {
            throw new BadRequestException("Only upcoming rides can be updated");
        }

        if (request.getSource() != null) ride.setSource(request.getSource());
        if (request.getDestination() != null) ride.setDestination(request.getDestination());
        if (request.getDateTime() != null) ride.setDateTime(request.getDateTime());
        if (request.getAvailableSeats() != null) ride.setAvailableSeats(request.getAvailableSeats());
        if (request.getCostPerPerson() != null) ride.setCostPerPerson(request.getCostPerPerson());
        if (request.getDescription() != null) ride.setDescription(request.getDescription());
        if (request.getAllowFemaleOnly() != null) ride.setAllowFemaleOnly(request.getAllowFemaleOnly());

        Ride savedRide = rideRepository.save(ride);
        return mapToRideResponse(savedRide);
    }

    @Override
    @Transactional
    public void deleteRide(String rideId) {
        logger.info("=== DELETE RIDE START ===");
        logger.info("Attempting to delete ride with ID: {}", rideId);

        try {
            Ride ride = rideRepository.findById(rideId)
                    .orElseThrow(() -> {
                        logger.error("Ride not found with ID: {}", rideId);
                        return ResourceNotFoundException.ride(rideId);
                    });

            String userId = getCurrentUserId();
            logger.info("Current user ID: {}, Ride owner ID: {}", userId, ride.getOwner().getId());

            if (!ride.getOwner().getId().equals(userId) && !isAdmin()) {
                logger.warn("User {} attempted to delete ride {} owned by {}",
                        userId, rideId, ride.getOwner().getId());
                throw new UnauthorizedException("You don't have permission to delete this ride");
            }

            // Delete all related entities in order
            try {
                List<Notification> notifications = notificationRepository.findAll().stream()
                        .filter(n -> rideId.equals(n.getReferenceId()))
                        .toList();
                if (!notifications.isEmpty()) {
                    notificationRepository.deleteAll(notifications);
                }
            } catch (Exception e) {
                logger.warn("Could not delete notifications: {}", e.getMessage());
            }

            try {
                List<Message> messages = messageRepository.findByRideIdOrderByTimestampAsc(rideId);
                if (!messages.isEmpty()) {
                    messageRepository.deleteAll(messages);
                }
            } catch (Exception e) {
                logger.error("Error deleting messages: {}", e.getMessage());
                throw new BadRequestException("Cannot delete ride: Failed to remove messages - " + e.getMessage());
            }

            try {
                List<Review> reviews = reviewRepository.findByRideId(rideId);
                if (!reviews.isEmpty()) {
                    reviewRepository.deleteAll(reviews);
                }
            } catch (Exception e) {
                logger.error("Error deleting reviews: {}", e.getMessage());
                throw new BadRequestException("Cannot delete ride: Failed to remove reviews - " + e.getMessage());
            }

            try {
                List<RideRequest> requests = rideRequestRepository.findByRideId(rideId);
                if (!requests.isEmpty()) {
                    rideRequestRepository.deleteAll(requests);
                }
            } catch (Exception e) {
                logger.error("Error deleting ride requests: {}", e.getMessage());
                throw new BadRequestException("Cannot delete ride: Failed to remove requests - " + e.getMessage());
            }

            rideRepository.delete(ride);
            logger.info("=== RIDE {} DELETED SUCCESSFULLY ===", rideId);

        } catch (ResourceNotFoundException | UnauthorizedException | BadRequestException e) {
            logger.error("Error deleting ride: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error deleting ride {}: {}", rideId, e.getMessage(), e);
            throw new BadRequestException("Cannot delete ride: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void cancelRide(String rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> ResourceNotFoundException.ride(rideId));

        String userId = getCurrentUserId();
        if (!ride.getOwner().getId().equals(userId) && !isAdmin()) {
            throw new UnauthorizedException("Only the ride owner can cancel this ride");
        }

        ride.setStatus(RideStatus.CANCELLED);
        rideRepository.save(ride);
        logger.info("Ride {} cancelled", rideId);
    }

    @Override
    public RideResponse getRideById(String rideId) {
        logger.info("Getting ride by ID: {}", rideId);
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> ResourceNotFoundException.ride(rideId));
        return mapToRideResponse(ride);
    }

    @Override
    public Page<RideResponse> getAllRides(Pageable pageable) {
        logger.info("Getting all rides - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());

        try {
            List<Ride> allRides = rideRepository.findAll();
            logger.info("Found {} total rides in database", allRides.size());

            for (Ride ride : allRides) {
                logger.debug("Ride in DB: ID={}, Source={}, Destination={}, Status={}, Owner={}, TotalSeats={}, AvailableSeats={}",
                        ride.getId(),
                        ride.getSource(),
                        ride.getDestination(),
                        ride.getStatus(),
                        ride.getOwner() != null ? ride.getOwner().getName() : "null",
                        ride.getTotalSeats(),
                        ride.getAvailableSeats());
            }

            List<Ride> upcomingRides = allRides.stream()
                    .filter(ride -> ride.getStatus() == RideStatus.UPCOMING)
                    .filter(ride -> ride.getAvailableSeats() != null && ride.getAvailableSeats() > 0)
                    .collect(Collectors.toList());

            logger.info("Filtered to {} upcoming rides with available seats", upcomingRides.size());

            List<RideResponse> rideResponses = new ArrayList<>();
            for (Ride ride : upcomingRides) {
                try {
                    RideResponse response = mapToRideResponse(ride);
                    if (response != null) {
                        rideResponses.add(response);
                    }
                } catch (Exception e) {
                    logger.error("Error mapping ride {}: {}", ride.getId(), e.getMessage());
                }
            }

            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), rideResponses.size());

            if (start >= rideResponses.size()) {
                return new PageImpl<>(new ArrayList<>(), pageable, rideResponses.size());
            }

            List<RideResponse> pageContent = rideResponses.subList(start, end);
            logger.info("Returning {} rides for page {}", pageContent.size(), pageable.getPageNumber());

            return new PageImpl<>(pageContent, pageable, rideResponses.size());

        } catch (Exception e) {
            logger.error("Error in getAllRides: {}", e.getMessage(), e);
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
    }

    @Override
    public List<RideResponse> getMyRides() {
        String userId = getCurrentUserId();
        logger.info("=== GET MY RIDES ===");
        logger.info("User ID: {}", userId);

        try {
            List<Ride> allRides = rideRepository.findAll();
            logger.info("Total rides in database: {}", allRides.size());

            List<RideResponse> myRides = new ArrayList<>();

            for (Ride ride : allRides) {
                try {
                    boolean isOwner = ride.getOwner() != null && ride.getOwner().getId().equals(userId);

                    boolean isParticipant = false;
                    if (!isOwner) {
                        List<RideRequest> requests = rideRequestRepository.findByRideId(ride.getId());
                        isParticipant = requests.stream()
                                .anyMatch(req -> req.getUser() != null &&
                                        req.getUser().getId().equals(userId) &&
                                        req.getStatus() == com.travelthrottle.model.enums.RequestStatus.APPROVED);
                    }

                    if (isOwner || isParticipant) {
                        logger.info("Found ride for user: ID={}, isOwner={}, isParticipant={}",
                                ride.getId(), isOwner, isParticipant);

                        RideResponse response = mapToRideResponse(ride);
                        if (response != null) {
                            response.setIsOwner(isOwner);
                            myRides.add(response);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error processing ride {}: {}", ride.getId(), e.getMessage());
                }
            }

            logger.info("Found {} rides for user {}", myRides.size(), userId);
            return myRides;

        } catch (Exception e) {
            logger.error("Error in getMyRides: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<RideResponse> getUpcomingRides() {
        logger.info("Getting upcoming rides");

        try {
            List<Ride> allRides = rideRepository.findAll();
            List<RideResponse> upcoming = new ArrayList<>();

            LocalDateTime now = LocalDateTime.now();

            for (Ride ride : allRides) {
                try {
                    if (ride.getStatus() == RideStatus.UPCOMING &&
                            ride.getDateTime() != null &&
                            ride.getDateTime().isAfter(now) &&
                            ride.getAvailableSeats() != null &&
                            ride.getAvailableSeats() > 0) {

                        RideResponse response = mapToRideResponse(ride);
                        if (response != null) {
                            upcoming.add(response);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error processing ride {}: {}", ride.getId(), e.getMessage());
                }
            }

            logger.info("Found {} upcoming rides", upcoming.size());
            return upcoming;

        } catch (Exception e) {
            logger.error("Error in getUpcomingRides: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public Page<RideResponse> searchRides(String source, String destination, LocalDateTime startDate,
                                          LocalDateTime endDate, Double minPrice, Double maxPrice,
                                          Integer minSeats, Pageable pageable) {
        logger.info("Searching rides - source: {}, destination: {}", source, destination);

        try {
            List<Ride> allRides = rideRepository.findAll();
            List<RideResponse> filtered = new ArrayList<>();

            for (Ride ride : allRides) {
                try {
                    boolean matches = true;

                    if (source != null && !source.isEmpty()) {
                        matches = ride.getSource() != null &&
                                ride.getSource().toLowerCase().contains(source.toLowerCase());
                    }
                    if (matches && destination != null && !destination.isEmpty()) {
                        matches = ride.getDestination() != null &&
                                ride.getDestination().toLowerCase().contains(destination.toLowerCase());
                    }
                    if (matches && minPrice != null) {
                        matches = ride.getCostPerPerson() != null &&
                                ride.getCostPerPerson() >= minPrice;
                    }
                    if (matches && maxPrice != null) {
                        matches = ride.getCostPerPerson() != null &&
                                ride.getCostPerPerson() <= maxPrice;
                    }
                    if (matches && minSeats != null) {
                        matches = ride.getAvailableSeats() != null &&
                                ride.getAvailableSeats() >= minSeats;
                    }
                    if (matches && ride.getStatus() != RideStatus.UPCOMING) {
                        matches = false;
                    }
                    if (matches && ride.getAvailableSeats() != null && ride.getAvailableSeats() <= 0) {
                        matches = false;
                    }

                    if (matches) {
                        RideResponse response = mapToRideResponse(ride);
                        if (response != null) {
                            filtered.add(response);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error processing ride {}: {}", ride.getId(), e.getMessage());
                }
            }

            logger.info("Found {} rides matching search criteria", filtered.size());

            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filtered.size());

            if (start >= filtered.size()) {
                return new PageImpl<>(new ArrayList<>(), pageable, filtered.size());
            }

            List<RideResponse> pageContent = filtered.subList(start, end);
            return new PageImpl<>(pageContent, pageable, filtered.size());

        } catch (Exception e) {
            logger.error("Error in searchRides: {}", e.getMessage(), e);
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
    }

    @Override
    @Transactional
    public void decrementAvailableSeats(String rideId) {
        logger.info("Decrementing available seats for ride: {}", rideId);
        int updated = rideRepository.decrementAvailableSeats(rideId);
        logger.info("Decremented seats, rows updated: {}", updated);
    }

    @Override
    @Transactional
    public void incrementAvailableSeats(String rideId) {
        logger.info("Incrementing available seats for ride: {}", rideId);
        int updated = rideRepository.incrementAvailableSeats(rideId);
        logger.info("Incremented seats, rows updated: {}", updated);
    }

    @Override
    public boolean isRideFull(String rideId) {
        Ride ride = rideRepository.findById(rideId).orElse(null);
        return ride != null && ride.isFull();
    }

    @Override
    public boolean canUserJoinRide(String rideId, String userId) {
        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return false;

        if (ride.getOwner().getId().equals(userId)) return false;

        List<RideRequest> requests = rideRequestRepository.findByRideId(rideId);
        boolean alreadyApproved = requests.stream()
                .anyMatch(req -> req.getUser().getId().equals(userId) && req.isApproved());
        if (alreadyApproved) return false;

        return ride.canJoin();
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
                        .phone(owner.getPhone());
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

    // Other required methods
    @Override public RideSummaryResponse getRideSummary(String rideId) { return null; }
    @Override public List<RideResponse> getUserCreatedRides(String userId) { return new ArrayList<>(); }
    @Override public List<RideResponse> getUserJoinedRides(String userId) { return new ArrayList<>(); }
    @Override public List<RideResponse> getRidesByStatus(RideStatus status) { return new ArrayList<>(); }
    @Override public void updateRideStatus(String rideId, RideStatus status) {}
}