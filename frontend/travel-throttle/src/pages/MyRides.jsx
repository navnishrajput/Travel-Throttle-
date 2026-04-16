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
import { 
  FiPlus, FiList, FiUser, FiRefreshCw, FiChevronDown, FiChevronUp, 
  FiCheck, FiX, FiLoader, FiAlertCircle, FiCheckCircle, FiXCircle 
} from 'react-icons/fi';
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
  const [approvingRequest, setApprovingRequest] = useState({});
  const [rejectingRequest, setRejectingRequest] = useState({});
  const [cancellingRequest, setCancellingRequest] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

const handleApproveRequest = async (rideId, requestId, seatsRequested) => {
  console.log('=== APPROVE REQUEST ===');
  console.log('RideId:', rideId, 'RequestId:', requestId, 'Seats:', seatsRequested);
  
  setApprovingRequest(prev => ({ ...prev, [requestId]: true }));
  setError('');
  setSuccessMessage('');
  
  try {
    const response = await requestService.approveRequest(requestId);
    console.log('Approve response:', response);
    
    if (response.success) {
      setSuccessMessage(`Request approved successfully! ${seatsRequested} seat(s) allocated.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await fetchRequestsForRide(rideId);
      setRefreshKey(prev => prev + 1);
    } else {
      // Show the actual error message from backend
      const errorMsg = response.error || response.message || 'Failed to approve request';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  } catch (error) {
    console.error('Approve error:', error);
    const errorMsg = error?.response?.data?.message || 
                     error?.message || 
                     'Failed to approve request. Please try again.';
    setError(errorMsg);
    setTimeout(() => setError(''), 5000);
  } finally {
    setApprovingRequest(prev => ({ ...prev, [requestId]: false }));
  }
};
  const handleRejectRequest = async (rideId, requestId) => {
    console.log('Rejecting request:', requestId);
    
    setRejectingRequest(prev => ({ ...prev, [requestId]: true }));
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await requestService.rejectRequest(requestId);
      console.log('Reject response:', response);
      
      if (response.success) {
        setSuccessMessage('Request rejected');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh requests list
        await fetchRequestsForRide(rideId);
      } else {
        setError(response.error || 'Failed to reject request');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Reject error:', error);
      setError('Failed to reject request. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setRejectingRequest(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleCancelMyRequest = async (requestId, rideId) => {
    if (!confirm('Cancel your request to join this ride?')) return;
    
    setCancellingRequest(prev => ({ ...prev, [requestId]: true }));
    try {
      const response = await requestService.cancelRequest(requestId);
      if (response.success) {
        alert('Request cancelled');
        setRefreshKey(prev => prev + 1);
      } else {
        alert(response.error || 'Failed to cancel request');
      }
    } catch (error) {
      alert('Failed to cancel request');
    } finally {
      setCancellingRequest(prev => ({ ...prev, [requestId]: false }));
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

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-lg flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-error" />
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-3">
          <FiCheckCircle className="w-5 h-5 text-success" />
          <p className="text-success text-sm">{successMessage}</p>
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
              const pendingRequests = requests.filter(r => r.status === 'PENDING');
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
                  
                  {/* Show requests section for created rides (owner) */}
                  {activeTab === 'created' && (
                    <div className="border-t border-dark-border bg-dark-bg/30">
                      <button
                        onClick={() => toggleExpand(ride.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-dark-bg/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-primary" />
                          <span className="text-white">
                            {pendingRequests.length > 0 ? (
                              <span className="flex items-center gap-2">
                                Incoming Requests
                                <Badge variant="warning" size="sm">{pendingRequests.length}</Badge>
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
                              <FiLoader className="w-5 h-5 text-primary animate-spin" />
                            </div>
                          ) : requests.length > 0 ? (
                            <div className="space-y-3">
                              {requests.map(req => {
                                const isApproving = approvingRequest[req.id];
                                const isRejecting = rejectingRequest[req.id];
                                const isCancelling = cancellingRequest[req.id];
                                const isOwnRequest = req.user?.id === user?.id;
                                
                                return (
                                  <div key={req.id} className="p-3 bg-dark-card/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Avatar src={req.user?.avatar} name={req.user?.name} size="sm" />
                                      <div className="flex-1">
                                        <p className="text-white text-sm font-medium">
                                          {req.user?.name}
                                          {isOwnRequest && <span className="text-gray-400 ml-2">(You)</span>}
                                        </p>
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
                                    
                                    {/* Owner Actions - Approve/Reject */}
                                    {req.status === 'PENDING' && !isOwnRequest && (
                                      <div className="flex gap-2 mt-3">
                                        <Button 
                                          size="sm" 
                                          variant="primary" 
                                          leftIcon={isApproving ? <FiLoader className="animate-spin" /> : <FiCheck />}
                                          onClick={() => handleApproveRequest(ride.id, req.id, req.seatsRequested)}
                                          disabled={isApproving || isRejecting}
                                        >
                                          {isApproving ? 'Approving...' : 'Approve'}
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          leftIcon={isRejecting ? <FiLoader className="animate-spin" /> : <FiX />}
                                          onClick={() => handleRejectRequest(ride.id, req.id)}
                                          disabled={isApproving || isRejecting}
                                        >
                                          {isRejecting ? 'Rejecting...' : 'Reject'}
                                        </Button>
                                      </div>
                                    )}
                                    
                                    {/* Requester Action - Cancel */}
                                    {req.status === 'PENDING' && isOwnRequest && (
                                      <div className="flex gap-2 mt-3">
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          leftIcon={isCancelling ? <FiLoader className="animate-spin" /> : <FiXCircle />}
                                          onClick={() => handleCancelMyRequest(req.id, ride.id)}
                                          disabled={isCancelling}
                                          className="text-warning"
                                        >
                                          {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm py-3 text-center">No requests yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Show cancel option for joined rides (passenger's own requests) */}
                  {activeTab === 'joined' && (
                    <div className="border-t border-dark-border bg-dark-bg/30 p-3">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        leftIcon={<FiXCircle />}
                        onClick={async () => {
                          const response = await requestService.getMyRequests();
                          if (response.success) {
                            const myReq = response.data.find(r => r.ride?.id === ride.id && r.status === 'APPROVED');
                            if (myReq) {
                              handleCancelMyRequest(myReq.id, ride.id);
                            }
                          }
                        }}
                        className="text-warning"
                      >
                        Leave Ride
                      </Button>
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