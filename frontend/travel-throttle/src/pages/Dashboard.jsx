/**
 * DASHBOARD PAGE
 * Main dashboard with real data from backend
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services/rideService';
import { userService } from '../services/userService';
import { cn, formatDate, formatCurrency } from '../utils/helpers';
import { ROUTES, IMAGES } from '../constants';
import { Card, Button, Badge, Avatar } from '../components/common';
import { RideCard } from '../components/features';
import { 
  FiPlus, 
  FiSearch, 
  FiTrendingUp, 
  FiUsers, 
  FiMapPin,
  FiArrowRight
} from 'react-icons/fi';

export const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRides: 0,
    totalDistance: 0,
    totalSaved: 0,
    upcomingRides: 0,
  });
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [recentRides, setRecentRides] = useState([]);
  const [userProfile, setUserProfile] = useState(user);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      // Fetch user profile
      const profileResult = await userService.getCurrentUser();
      if (profileResult.success && profileResult.data) {
        setUserProfile(profileResult.data);
        setStats(prev => ({
          ...prev,
          totalRides: profileResult.data.totalRides || 0,
          totalDistance: profileResult.data.totalDistance || 0,
          totalSaved: profileResult.data.totalSaved || 0,
        }));
      }
      
      // Fetch upcoming rides
      const upcomingResult = await rideService.getUpcomingRides();
      if (upcomingResult.success && upcomingResult.data) {
        // Filter out null values
        const validRides = upcomingResult.data.filter(ride => ride && ride.id);
        setUpcomingRides(validRides.slice(0, 5));
        setStats(prev => ({
          ...prev,
          upcomingRides: validRides.length,
        }));
      }
      
      // Fetch my rides for recent activity
      const myRidesResult = await rideService.getMyRides();
      if (myRidesResult.success && myRidesResult.data) {
        // Filter out null values
        const validRides = myRidesResult.data.filter(ride => ride && ride.id);
        setRecentRides(validRides.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <Icon className="w-full h-full" />
      </div>
      <div className="relative">
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center mb-3',
          `bg-${color}/20`
        )}>
          <Icon className={cn('w-6 h-6', `text-${color}`)} />
        </div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">
          {loading ? '...' : value}
        </p>
      </div>
    </Card>
  );
  
  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {userProfile?.name?.split(' ')[0] || 'Rider'}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Ready for your next adventure?
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link to={ROUTES.PROTECTED.FIND_RIDE.path}>
            <Button variant="outline" leftIcon={<FiSearch className="w-4 h-4" />}>
              Find Ride
            </Button>
          </Link>
          <Link to={ROUTES.PROTECTED.CREATE_RIDE.path}>
            <Button variant="primary" leftIcon={<FiPlus className="w-4 h-4" />}>
              Create Ride
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={FiMapPin} 
          label="Total Rides" 
          value={stats.totalRides}
          color="primary"
        />
        <StatCard 
          icon={FiTrendingUp} 
          label="Distance Covered" 
          value={`${stats.totalDistance} km`}
          color="secondary"
        />
        <StatCard 
          icon={FiUsers} 
          label="Upcoming Rides" 
          value={stats.upcomingRides}
          color="accent"
        />
        <StatCard 
          icon={FiTrendingUp} 
          label="Money Saved" 
          value={formatCurrency.standard(stats.totalSaved)}
          color="success"
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Rides */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Rides */}
          <Card>
            <Card.Header 
              action={
                <Link 
                  to={ROUTES.PROTECTED.MY_RIDES.path}
                  className="text-sm text-primary hover:text-primary-light flex items-center gap-1"
                >
                  View All <FiArrowRight className="w-4 h-4" />
                </Link>
              }
            >
              Upcoming Rides
            </Card.Header>
            
            <Card.Body>
              {upcomingRides.length > 0 ? (
                <div className="space-y-3">
                  {upcomingRides.map(ride => (
                    <RideCard 
                      key={ride.id} 
                      ride={ride} 
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <img 
                    src={IMAGES.EMPTY_STATES?.NO_RIDES?.src || ''} 
                    alt="No rides"
                    className="w-32 h-32 mx-auto mb-4 opacity-50"
                  />
                  <p className="text-gray-400 mb-3">No upcoming rides</p>
                  <Link to={ROUTES.PROTECTED.FIND_RIDE.path}>
                    <Button variant="primary" size="sm">
                      Find a Ride
                    </Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <Card.Header>Recent Activity</Card.Header>
            <Card.Body>
              <div className="space-y-3">
                {recentRides.length > 0 ? (
                  recentRides.map(ride => (
                    <div key={ride.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-bg/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <FiMapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {ride.source} → {ride.destination}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate.relative(ride.dateTime || ride.date)} • {ride.owner?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant={ride.status === 'COMPLETED' ? 'success' : 'info'}>
                        {ride.status || 'UPCOMING'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No recent activity</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
        
        {/* Right Column - Profile & Quick Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <div className="text-center">
              <Avatar 
                src={userProfile?.avatar} 
                name={userProfile?.name || 'User'}
                size="xl"
                className="mx-auto mb-3"
              />
              <h3 className="text-xl font-bold text-white">{userProfile?.name || 'User'}</h3>
              <p className="text-gray-400 text-sm mb-3">{userProfile?.email || ''}</p>
              
              <div className="flex items-center justify-center gap-1 mb-4">
                <span className="text-yellow-500">★</span>
                <span className="text-white font-semibold">
                  {userProfile?.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-400 text-sm">({userProfile?.totalRides || 0} rides)</span>
              </div>
              
              <Link to={ROUTES.PROTECTED.PROFILE.path}>
                <Button variant="outline" size="sm" fullWidth>
                  View Profile
                </Button>
              </Link>
            </div>
          </Card>
          
          {/* Quick Stats */}
          <Card>
            <Card.Header>Quick Stats</Card.Header>
            <Card.Body className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Member since</span>
                <span className="text-white">{formatDate.short(userProfile?.createdAt) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verification</span>
                <Badge variant={userProfile?.verified ? 'success' : 'warning'}>
                  {userProfile?.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bike Owner</span>
                <Badge variant={userProfile?.hasBike ? 'success' : 'default'}>
                  {userProfile?.hasBike ? 'Yes' : 'No'}
                </Badge>
              </div>
            </Card.Body>
          </Card>
          
          {/* Safety Tips */}
          <Card variant="glass">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <FiTrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Safety First!</h4>
                <p className="text-sm text-gray-300">
                  Always wear a helmet and follow traffic rules. Use the SOS button in case of emergency.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;