/**
 * ROUTE CONSTANTS
 */

const PUBLIC_ROUTES = {
  HOME: { path: '/', name: 'Home' },
  LOGIN: { path: '/login', name: 'Login' },
  SIGNUP: { path: '/signup', name: 'Sign Up' },
};

const PROTECTED_ROUTES = {
  DASHBOARD: { path: '/dashboard', name: 'Dashboard' },
  CREATE_RIDE: { path: '/create-ride', name: 'Create Ride' },
  FIND_RIDE: { path: '/find-ride', name: 'Find Ride' },
  RIDE_DETAILS: { path: '/rides/:id', name: 'Ride Details' },
  MY_RIDES: { path: '/my-rides', name: 'My Rides' },
  PROFILE: { path: '/profile', name: 'Profile' },
  GARAGE: { path: '/garage', name: 'My Garage' },
  MESSAGES: { path: '/messages', name: 'Messages' },
  NOTIFICATIONS: { path: '/notifications', name: 'Notifications' },
};

export const ROUTES = {
  PUBLIC: PUBLIC_ROUTES,
  PROTECTED: PROTECTED_ROUTES,
  NAVIGATION: [
    { ...PROTECTED_ROUTES.DASHBOARD, id: 'nav-dashboard' },
    { ...PROTECTED_ROUTES.FIND_RIDE, id: 'nav-find-ride' },
    { ...PROTECTED_ROUTES.CREATE_RIDE, id: 'nav-create-ride' },
    { ...PROTECTED_ROUTES.MY_RIDES, id: 'nav-my-rides' },
    { ...PROTECTED_ROUTES.MESSAGES, id: 'nav-messages' },
    { ...PROTECTED_ROUTES.GARAGE, id: 'nav-garage' },
    { ...PROTECTED_ROUTES.PROFILE, id: 'nav-profile' },
  ],
};

export default ROUTES;