/**
 * APP COMPONENT
 * Root application component with routing
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout, AuthLayout } from './components/layouts';
import Landing from './pages/Landing';
import OAuth2Redirect from './pages/OAuth2Redirect';
import GroupRides from './pages/GroupRides';
import CreateGroupRide from './pages/CreateGroupRide';
import GroupRideDetails from './pages/GroupRideDetails';
import { 
  Login, 
  Signup, 
  Dashboard, 
  CreateRide, 
  FindRide, 
  RideDetails, 
  Profile,
  MyRides,
  Messages,
  Garage,
  Notifications
} from './pages';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={
        <PublicRoute>
          <Landing />
        </PublicRoute>
      } />
      
      {/* OAuth2 Redirect Route */}
      <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/find-ride" element={
          <ProtectedRoute>
            <FindRide />
          </ProtectedRoute>
        } />
        <Route path="/create-ride" element={
          <ProtectedRoute>
            <CreateRide />
          </ProtectedRoute>
        } />
        <Route path="/rides/:id" element={
          <ProtectedRoute>
            <RideDetails />
          </ProtectedRoute>
        } />
        <Route path="/my-rides" element={
          <ProtectedRoute>
            <MyRides />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/garage" element={
          <ProtectedRoute>
            <Garage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        
        {/* NEW GROUP RIDE ROUTES */}
        <Route path="/group-rides" element={
          <ProtectedRoute>
            <GroupRides />
          </ProtectedRoute>
        } />
        <Route path="/create-group-ride" element={
          <ProtectedRoute>
            <CreateGroupRide />
          </ProtectedRoute>
        } />
        <Route path="/group-rides/:id" element={
          <ProtectedRoute>
            <GroupRideDetails />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;