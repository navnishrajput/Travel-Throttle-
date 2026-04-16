-- ============================================
-- INITIAL DATA FOR TRAVEL THROTTLE
-- ============================================

-- Clear existing data (for development)
DELETE FROM notifications;
DELETE FROM messages;
DELETE FROM ride_requests;
DELETE FROM reviews;
DELETE FROM rides;
DELETE FROM bikes;
DELETE FROM user_roles;
DELETE FROM users;

-- Insert sample users
-- Password is 'password123' for all users (BCrypt encoded)
INSERT INTO users (id, name, email, phone, password, has_bike, verified, rating, total_rides, created_at) VALUES
('user-1', 'Rahul Sharma', 'rahul@travelthrottle.com', '9876543210', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', true, true, 4.8, 24, NOW()),
('user-2', 'Priya Patel', 'priya@travelthrottle.com', '9876543211', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', false, true, 4.9, 15, NOW()),
('user-3', 'Amit Kumar', 'amit@travelthrottle.com', '9876543212', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', true, true, 4.7, 32, NOW()),
('user-4', 'Sneha Reddy', 'sneha@travelthrottle.com', '9876543213', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', false, true, 5.0, 8, NOW()),
('admin', 'Admin User', 'admin@travelthrottle.com', '9876543299', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', false, true, 5.0, 0, NOW());

-- Insert user roles
INSERT INTO user_roles (user_id, role) VALUES
('user-1', 'ROLE_USER'),
('user-2', 'ROLE_USER'),
('user-3', 'ROLE_USER'),
('user-4', 'ROLE_USER'),
('admin', 'ROLE_ADMIN'),
('admin', 'ROLE_USER');

-- Insert sample bikes
INSERT INTO bikes (id, model, registration_number, color, year, mileage, capacity, verified, user_id, created_at) VALUES
('bike-1', 'Royal Enfield Classic 350', 'MH01AB1234', 'Black', 2023, '35 km/l', 2, true, 'user-1', NOW()),
('bike-2', 'Bajaj Pulsar NS200', 'MH02CD5678', 'Red', 2024, '35 km/l', 2, true, 'user-1', NOW()),
('bike-3', 'KTM Duke 390', 'MH03EF9012', 'Orange', 2023, '25 km/l', 1, true, 'user-3', NOW()),
('bike-4', 'Honda CB350', 'MH04GH3456', 'Blue', 2024, '40 km/l', 2, true, 'user-3', NOW());

-- Insert sample rides with future dates
INSERT INTO rides (id, source, destination, date_time, available_seats, total_seats, cost_per_person, distance, duration, description, allow_female_only, status, owner_id, bike_id, created_at) VALUES
('ride-1', 'Andheri West, Mumbai', 'Lonavala', NOW() + INTERVAL '5 days', 2, 2, 300.0, 85.0, '2.5 hours', 'Weekend ride to Lonavala. We will stop for breakfast at Khopoli.', false, 'UPCOMING', 'user-1', 'bike-1', NOW()),
('ride-2', 'Powai, Mumbai', 'Alibaug Beach', NOW() + INTERVAL '3 days', 1, 1, 250.0, 95.0, '3 hours', 'Early morning ride to Alibaug. Beach day!', false, 'UPCOMING', 'user-3', 'bike-3', NOW()),
('ride-3', 'Thane, Mumbai', 'Matheran', NOW() - INTERVAL '2 days', 0, 1, 200.0, 80.0, '2 hours', 'Quick getaway to Matheran', false, 'COMPLETED', 'user-3', 'bike-4', NOW()),
('ride-4', 'Bandra, Mumbai', 'Pune', NOW() + INTERVAL '7 days', 3, 3, 400.0, 150.0, '3.5 hours', 'Expressway ride to Pune', false, 'UPCOMING', 'user-1', 'bike-2', NOW()),
('ride-5', 'Vashi, Navi Mumbai', 'Igatpuri', NOW() + INTERVAL '2 days', 2, 2, 350.0, 120.0, '3 hours', 'Monsoon ride to Igatpuri', false, 'UPCOMING', 'user-1', 'bike-1', NOW()),
('ride-6', 'Dadar, Mumbai', 'Mahabaleshwar', NOW() + INTERVAL '4 days', 2, 2, 500.0, 250.0, '5 hours', 'Long weekend ride to Mahabaleshwar', false, 'UPCOMING', 'user-3', 'bike-4', NOW());

-- Insert sample ride requests
INSERT INTO ride_requests (id, status, message, seats_requested, ride_id, user_id, created_at) VALUES
('req-1', 'APPROVED', 'Excited for the ride!', 1, 'ride-1', 'user-2', NOW()),
('req-2', 'PENDING', 'Can I join?', 1, 'ride-2', 'user-4', NOW()),
('req-3', 'APPROVED', 'Looking forward to it!', 1, 'ride-3', 'user-2', NOW() - INTERVAL '3 days');

-- Update available seats for approved requests
UPDATE rides SET available_seats = available_seats - 1 WHERE id = 'ride-1';
UPDATE rides SET available_seats = available_seats - 1 WHERE id = 'ride-3';

-- Insert sample messages
INSERT INTO messages (id, content, type, is_read, ride_id, sender_id, timestamp) VALUES
('msg-1', 'Hey everyone! Excited for the ride to Lonavala!', 'TEXT', true, 'ride-1', 'user-1', NOW() - INTERVAL '1 day'),
('msg-2', 'Same here! What time should we meet?', 'TEXT', true, 'ride-1', 'user-2', NOW() - INTERVAL '1 day'),
('msg-3', 'Let us meet at 7:30 AM near Andheri station.', 'TEXT', false, 'ride-1', 'user-1', NOW() - INTERVAL '2 hours'),
('msg-4', 'Priya Patel joined the ride', 'SYSTEM', false, 'ride-1', null, NOW() - INTERVAL '3 hours');

-- Insert sample reviews
INSERT INTO reviews (id, rating, comment, is_public, ride_id, reviewer_id, reviewed_id, created_at) VALUES
('rev-1', 5, 'Great riding experience! Very punctual and safe driver.', true, 'ride-3', 'user-2', 'user-3', NOW() - INTERVAL '1 day'),
('rev-2', 5, 'Priya was a wonderful passenger. Very courteous!', true, 'ride-3', 'user-3', 'user-2', NOW() - INTERVAL '1 day');

-- Insert sample notifications
INSERT INTO notifications (id, type, title, message, is_read, reference_id, user_id, created_at) VALUES
('notif-1', 'RIDE_REQUEST', 'New Join Request', 'Sneha Reddy wants to join your ride to Alibaug', false, 'ride-2', 'user-3', NOW()),
('notif-2', 'RIDE_APPROVED', 'Request Approved', 'Your request to join Lonavala ride has been approved', true, 'ride-1', 'user-2', NOW() - INTERVAL '1 day'),
('notif-3', 'NEW_MESSAGE', 'New Message', 'Rahul Sharma sent a message in Lonavala ride group', false, 'ride-1', 'user-2', NOW() - INTERVAL '2 hours');