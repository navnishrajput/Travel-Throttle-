/**
 * DASHBOARD PAGE - Modern Redesign
 * Professional dashboard with stats cards and smooth animations
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services/rideService';
import { userService } from '../services/userService';
import { groupRideService } from '../services/groupRideService';
import { cn, formatDate, formatCurrency } from '../utils/helpers';
import { ROUTES } from '../constants';
import { Card, Button, Badge, Avatar } from '../components/common';
import RideCard from '../components/features/RideCard';
import GroupRideCard from '../components/features/GroupRideCard';
import { 
  FiPlus, 
  FiSearch, 
  FiTrendingUp, 
  FiUsers, 
  FiMapPin,
  FiArrowRight,
  FiChevronRight,
  FiActivity,
  FiAward,
  FiCheckCircle
} from 'react-icons/fi';
import { FaMotorcycle, FaUsers as FaUsersIcon, FaRoute } from 'react-icons/fa';

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
  const [upcomingGroupRides, setUpcomingGroupRides] = useState([]);
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
        const validRides = upcomingResult.data.filter(ride => ride && ride.id);
        setUpcomingRides(validRides.slice(0, 3));
        setStats(prev => ({
          ...prev,
          upcomingRides: validRides.length,
        }));
      }
      
      // Fetch upcoming group rides - with error handling
      try {
        const groupResult = await groupRideService.getUpcomingGroupRides();
        if (groupResult.success && groupResult.data) {
          setUpcomingGroupRides(groupResult.data.slice(0, 2));
        } else {
          setUpcomingGroupRides([]);
        }
      } catch (groupError) {
        console.warn('Group rides not available:', groupError);
        setUpcomingGroupRides([]);
      }
      
      // Fetch my rides for recent activity
      const myRidesResult = await rideService.getMyRides();
      if (myRidesResult.success && myRidesResult.data) {
        const validRides = myRidesResult.data.filter(ride => ride && ride.id);
        setRecentRides(validRides.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const StatCard = ({ icon: Icon, label, value, color = 'primary', trend = null }) => (
    <Card className="stat-card group hover:scale-105 transition-all duration-300">
      <div className="relative z-10">
        <div className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300',
          `bg-gradient-to-br from-${color} to-${color}-dark shadow-lg shadow-${color}/30 group-hover:shadow-xl group-hover:shadow-${color}/40`
        )}>
          <Icon className={cn('w-6 h-6 text-white')} />
        </div>
        <p className="text-sm text-text-secondary font-medium mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-white font-heading">
            {loading ? <span className="skeleton w-16 h-8 rounded-lg inline-block" /> : value}
          </p>
          {trend && (
            <Badge variant={trend > 0 ? 'success' : 'error'} size="sm" className="mb-1">
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
  
  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loader loader-lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">
            Welcome back, <span className="gradient-text">{userProfile?.name?.split(' ')[0] || 'Rider'}</span>! 👋
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Ready for your next adventure on the open road?
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link to={ROUTES.PROTECTED.FIND_RIDE.path}>
            <Button variant="outline" className="border-2 border-white/20 hover:border-primary/50 hover:bg-primary/5 backdrop-blur-sm group">
              <FiSearch className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
              Find Ride
            </Button>
          </Link>
          <Link to={ROUTES.PROTECTED.CREATE_RIDE.path}>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105">
              <FiPlus className="w-4 h-4 mr-2" />
              Create Ride
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          icon={FaRoute} 
          label="Total Rides" 
          value={stats.totalRides}
          color="primary"
          trend={12}
        />
        <StatCard 
          icon={FiTrendingUp} 
          label="Distance Covered" 
          value={`${stats.totalDistance} km`}
          color="secondary"
          trend={8}
        />
        <StatCard 
          icon={FiUsers} 
          label="Upcoming Rides" 
          value={stats.upcomingRides}
          color="accent"
        />
        <StatCard 
          icon={FiActivity} 
          label="Money Saved" 
          value={formatCurrency.standard(stats.totalSaved)}
          color="success"
          trend={15}
        />
      </div>
      
      {/* Group Rides Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-semibold text-white font-heading flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FaUsersIcon className="text-primary w-5 h-5" />
              </div>
              Upcoming Group Rides
            </h3>
            <p className="text-text-secondary text-sm mt-1">Join multi-bike adventures with fellow riders</p>
          </div>
          <Link to="/group-rides" className="group flex items-center gap-2 text-primary hover:text-primary-light transition-colors">
            <span className="text-sm font-medium">View All</span>
            <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {upcomingGroupRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingGroupRides.map(ride => (
              <GroupRideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <Card className="glass-card text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
              <FaMotorcycle className="w-8 h-8 text-primary opacity-50" />
            </div>
            <p className="text-text-secondary mb-4">No upcoming group rides</p>
            <Link to="/create-group-ride">
              <Button variant="outline" className="border-2 border-white/20 hover:border-primary/50">
                <FiPlus className="w-4 h-4 mr-2" />
                Create a Group Ride
              </Button>
            </Link>
          </Card>
        )}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Rides */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-white font-heading">Upcoming Rides</h3>
                <p className="text-text-secondary text-sm">Your scheduled adventures</p>
              </div>
              <Link 
                to={ROUTES.PROTECTED.MY_RIDES.path}
                className="group flex items-center gap-1 text-sm text-primary hover:text-primary-light transition-colors"
              >
                View All 
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div>
              {upcomingRides.length > 0 ? (
                <div className="space-y-4">
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
                  <div className="w-14 h-14 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FiMapPin className="w-7 h-7 text-primary opacity-50" />
                  </div>
                  <p className="text-text-secondary mb-4">No upcoming rides scheduled</p>
                  <Link to={ROUTES.PROTECTED.FIND_RIDE.path}>
                    <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25">
                      <FiSearch className="w-4 h-4 mr-2" />
                      Find a Ride
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
          
          {/* Recent Activity */}
          <Card className="glass-card">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white font-heading">Recent Activity</h3>
              <p className="text-text-secondary text-sm">Your latest rides and updates</p>
            </div>
            <div className="space-y-3">
              {recentRides.length > 0 ? (
                recentRides.map(ride => (
                  <div key={ride.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FiMapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium group-hover:text-primary transition-colors">
                        {ride.source} → {ride.destination}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {formatDate.relative(ride.dateTime || ride.date)} • {ride.owner?.name || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant={ride.status === 'COMPLETED' ? 'success' : 'info'}>
                      {ride.status || 'UPCOMING'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary text-center py-6">No recent activity</p>
              )}
            </div>
          </Card>
        </div>
        
        {/* Right Column - Profile */}
        <div className="space-y-6">
          <Card className="glass-card text-center">
            <Avatar 
              src={userProfile?.avatar} 
              name={userProfile?.name || 'User'}
              size="xl"
              className="mx-auto mb-4 ring-4 ring-primary/20"
            />
            <h3 className="text-xl font-bold text-white font-heading">{userProfile?.name || 'User'}</h3>
            <p className="text-text-secondary text-sm mb-4">{userProfile?.email || ''}</p>
            
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < (userProfile?.rating || 0) ? 'text-yellow-500 fill-current' : 'text-text-muted'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-white font-semibold ml-2">
                {userProfile?.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-text-secondary text-sm">({userProfile?.totalRides || 0})</span>
            </div>
            
            <Link to={ROUTES.PROTECTED.PROFILE.path}>
              <Button variant="outline" fullWidth className="border-2 border-white/20 hover:border-primary/50 hover:bg-primary/5">
                View Full Profile
                <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </Card>
          
          <Card className="glass-card">
            <h3 className="text-lg font-semibold text-white font-heading mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-dark-bg/30 rounded-xl">
                <span className="text-text-secondary">Member since</span>
                <span className="text-white font-medium">{formatDate.short(userProfile?.createdAt) || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-bg/30 rounded-xl">
                <span className="text-text-secondary">Verification</span>
                <Badge variant={userProfile?.verified ? 'success' : 'warning'} size="md">
                  {userProfile?.verified ? (
                    <><FiCheckCircle className="w-3 h-3 mr-1" /> Verified</>
                  ) : 'Unverified'}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-bg/30 rounded-xl">
                <span className="text-text-secondary">Bike Owner</span>
                <Badge variant={userProfile?.hasBike ? 'success' : 'default'} size="md">
                  {userProfile?.hasBike ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </Card>
          
          <Card className="glass-card bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <FiAward className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1 font-heading">Safety First!</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
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