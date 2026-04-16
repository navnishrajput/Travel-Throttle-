/**
 * API ENDPOINTS
 * Centralized API endpoint constants for backend integration
 */

export const API_ENDPOINTS = {
  id: 'api-endpoints',
  
  // Auth endpoints
  AUTH: {
    id: 'auth-endpoints',
    SIGNUP: `/auth/signup`,
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    REFRESH_TOKEN: `/auth/refresh`,
  },
  
  // User endpoints
  USER: {
    id: 'user-endpoints',
    PROFILE: `/users/me`,
    UPDATE_PROFILE: `/users/me`,
    CHANGE_PASSWORD: `/users/change-password`,
    UPLOAD_AVATAR: `/users/avatar`,
    GET_PUBLIC_PROFILE: (userId) => `/users/${userId}`,
    SEARCH: `/users/search`,
  },
  
  // Ride endpoints
  RIDES: {
    id: 'rides-endpoints',
    CREATE: `/rides`,
    GET_ALL: `/rides`,
    GET_BY_ID: (rideId) => `/rides/${rideId}`,
    UPDATE: (rideId) => `/rides/${rideId}`,
    DELETE: (rideId) => `/rides/${rideId}`,
    SEARCH: `/rides/search`,
    MY_RIDES: `/rides/my-rides`,
    UPCOMING: `/rides/upcoming`,
    CANCEL: (rideId) => `/rides/${rideId}/cancel`,
  },
  
  // Ride Requests endpoints
  REQUESTS: {
    id: 'requests-endpoints',
    SEND: `/requests`,
    GET_FOR_RIDE: (rideId) => `/requests/ride/${rideId}`,
    GET_MY_REQUESTS: `/requests/my-requests`,
    APPROVE: (requestId) => `/requests/${requestId}/approve`,
    REJECT: (requestId) => `/requests/${requestId}/reject`,
    CANCEL: (requestId) => `/requests/${requestId}/cancel`,
  },
  
  // Chat endpoints
  CHAT: {
    id: 'chat-endpoints',
    GET_MESSAGES: (rideId) => `/chat/rides/${rideId}/messages`,
    SEND_MESSAGE: `/chat/messages`,
    MARK_AS_READ: (rideId) => `/chat/rides/${rideId}/read`,
    DELETE_MESSAGE: (messageId) => `/chat/messages/${messageId}`,
  },
  
  // Bike/Garage endpoints
  BIKES: {
    id: 'bikes-endpoints',
    ADD_BIKE: `/bikes`,
    GET_MY_BIKES: `/bikes/my-bikes`,
    GET_BIKE: (bikeId) => `/bikes/${bikeId}`,
    UPDATE_BIKE: (bikeId) => `/bikes/${bikeId}`,
    DELETE_BIKE: (bikeId) => `/bikes/${bikeId}`,
    UPLOAD_IMAGE: (bikeId) => `/bikes/${bikeId}/image`,
  },
  
  // Reviews endpoints
  REVIEWS: {
    id: 'reviews-endpoints',
    CREATE: `/reviews`,
    GET_FOR_USER: (userId) => `/reviews/user/${userId}`,
    GET_FOR_RIDE: (rideId) => `/reviews/ride/${rideId}`,
    UPDATE: (reviewId) => `/reviews/${reviewId}`,
    DELETE: (reviewId) => `/reviews/${reviewId}`,
  },
  
  // Notifications endpoints
  NOTIFICATIONS: {
    id: 'notifications-endpoints',
    GET_ALL: `/notifications`,
    GET_UNREAD_COUNT: `/notifications/unread/count`,
    MARK_AS_READ: (notificationId) => `/notifications/${notificationId}/read`,
    MARK_ALL_AS_READ: `/notifications/read-all`,
    DELETE: (notificationId) => `/notifications/${notificationId}`,
    DELETE_READ: `/notifications/read`,
  },
};

export default API_ENDPOINTS;