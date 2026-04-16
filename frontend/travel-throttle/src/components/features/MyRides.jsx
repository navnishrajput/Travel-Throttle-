/**
 * MY RIDES PAGE
 * Displays user's created and joined rides with inline requests
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, Avatar } from '../components/common';
import { RideCard } from '../components/features';
import { FiPlus, FiList, FiUser, FiRefreshCw, FiChevronDown, FiChevronUp, FiCheck, FiX } from 'react-icons/fi';
import { ROUTES } from '../constants';

export const MyRides = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [expandedRideId, setExpandedRideId] = useState(null);
  const [rideRequests, setRideRequests] = useState({});
  const [loadingRequests, setLoadingRequests] = useState({});
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchRides = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      console.log('Fetching my rides...');
      const response = await rideService.getMyRides();
      console.log('MyRides response:', response);
      
      if (response.success) {
        const rides = Array.isArray(response.data) ? response.data : [];
        const validRides = rides.filter(ride => ride && ride.id);
        
        const created = validRides.filter(ride => {
          if (ride.isOwner === true) return true;
          if (ride.owner && ride.owner.id === user?.id) return true;
          return false;
        });
        
        const joined = validRides.filter(ride => {
          if (ride.isOwner === false) return true;
          if (ride.owner && ride.owner.id !== user?.id) return true;
          return false;
        });
        
        console.log('Created rides:', created.length, 'Joined rides:', joined.length);
        
        setCreatedRides(created);
        setJoinedRides(joined);
      } else {
        setError(response.error || 'Failed to fetch rides');
        setCreatedRides([]);
        setJoinedRides([]);
      }
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      setError('Failed to fetch rides. Please try again.');
      setCreatedRides([]);
      setJoinedRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRides();
    }
  }, [fetchRides, user, refreshKey]);

  const fetchRequestsForRide = async (rideId) => {
    if (loadingRequests[rideId]) return;
    
    setLoadingRequests(prev => ({ ...prev, [rideId]: true }));
    try {
      const response = await requestService.getRequestsByRide(rideId);
      console.log('Requests for ride', rideId, ':', response);
      if (response.success) {
        setRideRequests(prev => ({ ...prev, [rideId]: response.data || [] }));
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoadingRequests(prev => ({ ...prev, [rideId]: false }));
    }
  };

  const toggleExpand = (rideId) => {
    if (expandedRideId === rideId) {
      setExpandedRideId(null);
    } else {
      setExpandedRideId(rideId);
      fetchRequestsForRide(rideId);
    }
  };

  const handleApproveRequest = async (rideId, requestId) => {
    try {
      const response = await requestService.approveRequest(requestId);
      if (response.success) {
        alert('Request approved!');
        // Refresh requests
        fetchRequestsForRide(rideId);
        // Refresh rides
        handleRefresh();
      } else {
        alert(response.error || 'Failed to approve');
      }
    } catch (error) {
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (rideId, requestId) => {
    try {
      const response = await requestService.rejectRequest(requestId);
      if (response.success) {
        alert('Request rejected');
        fetchRequestsForRide(rideId);
      } else {
        alert(response.error || 'Failed to reject');
      }
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setExpandedRideId(null);
    setRideRequests({});
  };

  const displayRides = activeTab === 'created' ? createdRides : joinedRides;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">My Rides</h1>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors ${refreshing ? 'animate-spin' : ''}`}
            disabled={refreshing}
            title="Refresh"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
        <Link to={ROUTES.PROTECTED.CREATE_RIDE.path}>
          <Button variant="primary" leftIcon={<FiPlus />}>
            Create New Ride
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      <Card>
        <div className="flex gap-2 border-b border-dark-border pb-3 mb-4">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'created' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white hover:bg-dark-bg'
            }`}
          >
            <FiList className="w-4 h-4" />
            Created Rides
            <Badge variant="primary" size="sm">{createdRides.length}</Badge>
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'joined' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white hover:bg-dark-bg'
            }`}
          >
            <FiUser className="w-4 h-4" />
            Joined Rides
            <Badge variant="primary" size="sm">{joinedRides.length}</Badge>
          </button>
        </div>

        {displayRides.length > 0 ? (
          <div className="space-y-4">
            {displayRides.map(ride => {
              const requests = rideRequests[ride.id] || [];
              const pendingCount = requests.filter(r => r.status === 'PENDING').length;
              const isExpanded = expandedRideId === ride.id;
              const isLoadingReqs = loadingRequests[ride.id];
              
              return (
                <div key={ride.id} className="border border-dark-border rounded-xl overflow-hidden">
                  {/* Ride Card */}
                  <RideCard 
                    ride={ride} 
                    variant="compact" 
                    onRefresh={handleRefresh}
                  />
                  
                  {/* Show requests section only for created rides (owner) */}
                  {activeTab === 'created' && (
                    <div className="border-t border-dark-border bg-dark-bg/30">
                      <button
                        onClick={() => toggleExpand(ride.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-dark-bg/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-primary" />
                          <span className="text-white">
                            {pendingCount > 0 ? (
                              <span className="flex items-center gap-2">
                                Incoming Requests
                                <Badge variant="warning" size="sm">{pendingCount}</Badge>
                              </span>
                            ) : (
                              'No pending requests'
                            )}
                          </span>
                        </span>
                        {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          {isLoadingReqs ? (
                            <div className="py-4 flex justify-center">
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : requests.length > 0 ? (
                            <div className="space-y-3">
                              {requests.map(req => (
                                <div key={req.id} className="p-3 bg-dark-card/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Avatar src={req.user?.avatar} name={req.user?.name} size="sm" />
                                    <div className="flex-1">
                                      <p className="text-white text-sm font-medium">{req.user?.name}</p>
                                      <p className="text-xs text-gray-400">{req.seatsRequested} seat(s) requested</p>
                                      {req.message && <p className="text-xs text-gray-300 mt-1">"{req.message}"</p>}
                                    </div>
                                    <Badge variant={
                                      req.status === 'PENDING' ? 'warning' : 
                                      req.status === 'APPROVED' ? 'success' : 'error'
                                    } size="sm">
                                      {req.status}
                                    </Badge>
                                  </div>
                                  
                                  {req.status === 'PENDING' && (
                                    <div className="flex gap-2 mt-3">
                                      <Button 
                                        size="sm" 
                                        variant="primary" 
                                        leftIcon={<FiCheck />}
                                        onClick={() => handleApproveRequest(ride.id, req.id)}
                                      >
                                        Approve
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        leftIcon={<FiX />}
                                        onClick={() => handleRejectRequest(ride.id, req.id)}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm py-3 text-center">No requests yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-3">
              {activeTab === 'created' 
                ? "You haven't created any rides yet." 
                : "You haven't joined any rides yet."}
            </p>
            {activeTab === 'created' && (
              <Link to={ROUTES.PROTECTED.CREATE_RIDE.path}>
                <Button variant="primary" size="sm">
                  Create Your First Ride
                </Button>
              </Link>
            )}
            {activeTab === 'joined' && (
              <Link to={ROUTES.PROTECTED.FIND_RIDE.path}>
                <Button variant="primary" size="sm">
                  Find a Ride to Join
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyRides;