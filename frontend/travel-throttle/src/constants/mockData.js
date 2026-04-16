/**
 * MOCK DATA
 * Temporary mock data for development
 */

export const MOCK_USERS = {
  id: 'mock-users',
  currentUser: {
    id: 'user-1',
    name: 'Rahul Sharma',
    email: 'rahul@travelthrottle.com',
    phone: '+91 98765 43210',
    hasBike: true,
    avatar: null,
    rating: 4.8,
    totalRides: 24,
    memberSince: '2024-01-15',
    verified: true,
  },
  users: [
    {
      id: 'user-2',
      name: 'Priya Patel',
      email: 'priya@example.com',
      hasBike: false,
      rating: 4.9,
      avatar: null,
    },
    {
      id: 'user-3',
      name: 'Amit Kumar',
      email: 'amit@example.com',
      hasBike: true,
      rating: 4.7,
      avatar: null,
    },
  ],
};

export const MOCK_BIKES = {
  id: 'mock-bikes',
  bikes: [
    {
      id: 'bike-1',
      userId: 'user-1',
      model: 'Royal Enfield Classic 350',
      registrationNumber: 'MH 01 AB 1234',
      color: 'Black',
      year: 2023,
      mileage: '35 km/l',
      capacity: 2,
      verified: true,
    },
    {
      id: 'bike-2',
      userId: 'user-1',
      model: 'Bajaj Pulsar NS200',
      registrationNumber: 'MH 02 CD 5678',
      color: 'Red',
      year: 2024,
      mileage: '35 km/l',
      capacity: 2,
      verified: true,
    },
  ],
};

export const MOCK_RIDES = {
  id: 'mock-rides',
  rides: [
    {
      id: 'ride-1',
      owner: MOCK_USERS.currentUser,
      bike: MOCK_BIKES.bikes[0],
      source: 'Andheri West, Mumbai',
      destination: 'Lonavala',
      date: '2026-04-20T08:00:00',
      availableSeats: 2,
      totalSeats: 2,
      costPerPerson: 300,
      distance: '85 km',
      duration: '2.5 hours',
      status: 'UPCOMING',
      participants: [MOCK_USERS.users[0]],
      description: 'Weekend ride to Lonavala',
    },
    {
      id: 'ride-2',
      owner: MOCK_USERS.users[1],
      bike: MOCK_BIKES.bikes[1],
      source: 'Powai, Mumbai',
      destination: 'Alibaug Beach',
      date: '2026-04-18T06:30:00',
      availableSeats: 1,
      totalSeats: 1,
      costPerPerson: 250,
      distance: '95 km',
      duration: '3 hours',
      status: 'UPCOMING',
      participants: [],
      description: 'Early morning ride to Alibaug',
    },
  ],
};

export const MOCK_CHAT_MESSAGES = {
  id: 'mock-chat',
  messages: [
    {
      id: 'msg-1',
      rideId: 'ride-1',
      sender: MOCK_USERS.currentUser,
      content: 'Hey everyone! Excited for the ride!',
      timestamp: '2026-04-10T11:00:00',
      type: 'TEXT',
    },
    {
      id: 'msg-2',
      rideId: 'ride-1',
      sender: MOCK_USERS.users[0],
      content: 'Same here! What time should we meet?',
      timestamp: '2026-04-10T11:05:00',
      type: 'TEXT',
    },
    {
      id: 'msg-3',
      rideId: 'ride-1',
      sender: null,
      content: 'Priya Patel joined the ride',
      timestamp: '2026-04-10T11:10:00',
      type: 'SYSTEM',
    },
  ],
};

export const MOCK_NOTIFICATIONS = {
  id: 'mock-notifications',
  notifications: [
    {
      id: 'notif-1',
      userId: 'user-1',
      type: 'RIDE_REQUEST',
      title: 'New Join Request',
      message: 'Priya Patel wants to join your ride to Lonavala',
      read: false,
      createdAt: '2026-04-10T11:30:00',
    },
    {
      id: 'notif-2',
      userId: 'user-1',
      type: 'RIDE_APPROVED',
      title: 'Request Approved',
      message: 'Your request to join Alibaug ride has been approved',
      read: true,
      createdAt: '2026-04-09T16:00:00',
    },
  ],
};

export const RIDE_STATUS = {
  UPCOMING: { value: 'UPCOMING', label: 'Upcoming', color: 'info' },
  ONGOING: { value: 'ONGOING', label: 'Ongoing', color: 'success' },
  COMPLETED: { value: 'COMPLETED', label: 'Completed', color: 'default' },
  CANCELLED: { value: 'CANCELLED', label: 'Cancelled', color: 'error' },
};

export const REQUEST_STATUS = {
  PENDING: { value: 'PENDING', label: 'Pending', color: 'warning' },
  APPROVED: { value: 'APPROVED', label: 'Approved', color: 'success' },
  REJECTED: { value: 'REJECTED', label: 'Rejected', color: 'error' },
  CANCELLED: { value: 'CANCELLED', label: 'Cancelled', color: 'default' },
};