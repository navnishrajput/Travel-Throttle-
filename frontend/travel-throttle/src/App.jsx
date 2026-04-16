/**
 * APP COMPONENT
 * Root application component with routing
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout, AuthLayout } from './components/layouts';
import { OAuth2Redirect } from './pages/OAuth2Redirect';
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
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Wrapper
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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* OAuth2 Redirect Route */}
      <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
      
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
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
      </Route>
      
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
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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