/**
 * RIDE DETAILS PAGE
 * Full-featured ride view with proper participants display for all users
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services/rideService';
import { requestService } from '../services/requestService';
import { chatService } from '../services/chatService';
import { bikeService } from '../services/bikeService';
import { formatDate, formatCurrency } from '../utils/helpers';
import { ROUTES, RIDE_STATUS } from '../constants';
import { Card, Button, Badge, Avatar, Modal, Input } from '../components/common';
import { 
  FiMapPin, FiCalendar, FiClock, FiUsers, FiDollarSign, FiNavigation,
  FiEdit2, FiTrash2, FiXCircle, FiSend, FiCheck, FiX, FiUserPlus,
  FiArrowLeft, FiShare2, FiMessageCircle, FiAlertCircle,
  FiUser, FiCheckCircle, FiPhone, FiChevronDown, FiChevronUp,
  FiRefreshCw, FiStar, FiLoader, FiAlertTriangle, FiEye, FiEyeOff
} from 'react-icons/fi';
import { FaMotorcycle, FaUserShield, FaUserFriends } from 'react-icons/fa';

export const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Core State
  const [loading, setLoading] = useState(true);
  const [ride, setRide] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [bikeParticipants, setBikeParticipants] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [userBikes, setUserBikes] = useState([]);
  
  // Join Type
  const [joinType, setJoinType] = useState(null);
  const [selectedBikeId, setSelectedBikeId] = useState('');
  
  // UI Toggles
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showBikeDetails, setShowBikeDetails] = useState(true);
  
  // Modals
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form Data
  const [requestMessage, setRequestMessage] = useState('');
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  
  // Loading States
  const [actionLoading, setActionLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatIntervalRef = useRef(null);
  
  // Computed Properties
  const isOwner = user?.id === ride?.owner?.id || ride?.isOwner === true;
  const isParticipant = allParticipants.some(p => p.id === user?.id);
  const isRequestPending = myRequest?.status === 'PENDING';
  const isRequestApproved = myRequest?.status === 'APPROVED';
  const isFull = ride?.availableSeats === 0;
  const statusConfig = ride ? RIDE_STATUS[ride.status] || RIDE_STATUS.UPCOMING : null;
  const userHasBike = userBikes.length > 0;
  
  // Permissions
  const canJoin = !isOwner && !myRequest && ride?.status === 'UPCOMING' && !isFull;
  const canJoinAsRider = canJoin && userHasBike;
  const canChat = isParticipant && (ride?.status === 'ONGOING' || ride?.status === 'UPCOMING');
  const canEdit = isOwner && ride?.status === 'UPCOMING';
  const canDelete = isOwner;
  const canCancel = isOwner && ride?.status === 'UPCOMING';
  const canViewRequests = isOwner;
  const totalParticipants = allParticipants.length;

  // Effects
  useEffect(() => {
    if (id) {
      fetchAllData();
      fetchUserBikes();
    }
    return () => {
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (ride && canChat && showChat) {
      fetchMessages();
      chatIntervalRef.current = setInterval(() => {
        fetchMessages(true);
      }, 3000);
    }
    return () => {
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
    };
  }, [ride, canChat, showChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRideDetails(),
        checkMyRequest(),
      ]);
      await fetchAllParticipantsData();
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBikes = async () => {
    try {
      const response = await bikeService.getMyBikes();
      if (response.success) {
        setUserBikes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching user bikes:', error);
    }
  };

  const fetchRideDetails = async () => {
    try {
      const response = await rideService.getRideById(id);
      console.log('Ride details:', response);
      if (response.success) {
        setRide(response.data);
      } else {
        alert('Failed to load ride details');
        navigate('/find-ride');
      }
    } catch (error) {
      console.error('Error fetching ride:', error);
      alert('Failed to load ride details');
      navigate('/find-ride');
    }
  };

  const checkMyRequest = async () => {
    try {
      const response = await requestService.getMyRequests();
      console.log('My requests:', response);
      if (response.success) {
        const request = response.data.find(r => r.ride?.id === id);
        setMyRequest(request || null);
      }
    } catch (error) {
      console.error('Error checking request:', error);
    }
  };

  // CRITICAL FIX: Fetch ALL participants - works for both owner and participants
  const fetchAllParticipantsData = async () => {
    console.log('=== FETCHING ALL PARTICIPANTS ===', id);
    
    try {
      // First get ride details to get owner info
      const rideResponse = await rideService.getRideById(id);
      console.log('Ride details for participants:', rideResponse);
      
      const bikeParticipantsList = [];
      const passengerParticipantsList = [];
      
      if (rideResponse.success && rideResponse.data) {
        const rideData = rideResponse.data;
        
        // Add owner as bike participant
        if (rideData.owner) {
          bikeParticipantsList.push({
            id: rideData.owner.id,
            name: rideData.owner.name,
            avatar: rideData.owner.avatar,
            role: 'owner',
            phone: rideData.owner.phone,
            bike: rideData.bike,
            isOwner: true
          });
        }
      }
      
      // CRITICAL: Fetch ALL approved requests for this ride
      // This endpoint should be accessible to all participants, not just owner
      try {
        // Use the public endpoint or modify backend to allow participants to view approved requests
        const requestsResponse = await requestService.getRequestsByRide(id);
        console.log('All requests for ride:', requestsResponse);
        
        if (requestsResponse.success && requestsResponse.data) {
          const approvedRequests = requestsResponse.data.filter(
            req => req.status === 'APPROVED'
          );
          
          console.log('Approved requests found:', approvedRequests.length);
          
          // Add approved passengers
          approvedRequests.forEach(req => {
            if (req.user) {
              passengerParticipantsList.push({
                id: req.user.id,
                name: req.user.name,
                avatar: req.user.avatar,
                role: 'passenger',
                seats: req.seatsRequested,
                phone: req.user.phone,
                isOwner: false
              });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        // If this fails, try to get participants from ride data
        if (rideResponse.success && rideResponse.data) {
          const rideData = rideResponse.data;
          if (rideData.participants) {
            rideData.participants.forEach(p => {
              passengerParticipantsList.push({
                ...p,
                role: 'passenger',
                isOwner: false
              });
            });
          }
        }
      }
      
      console.log('Bike participants:', bikeParticipantsList.length);
      console.log('Passenger participants:', passengerParticipantsList.length);
      
      setBikeParticipants(bikeParticipantsList);
      setParticipants(passengerParticipantsList);
      
      // Combine all participants for easy access
      const all = [...bikeParticipantsList, ...passengerParticipantsList];
      setAllParticipants(all);
      
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchMessages = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const response = await chatService.getMessages(id);
      console.log('Messages:', response);
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchRideDetails(),
      checkMyRequest(),
      fetchAllParticipantsData(),
    ]);
    setRefreshing(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenJoinModal = () => {
    setJoinType(null);
    setSelectedBikeId('');
    setRequestMessage('');
    setSeatsRequested(1);
    setShowJoinModal(true);
  };

  const handleJoinRequest = async () => {
    if (!joinType) {
      alert('Please select how you want to join');
      return;
    }

    if (joinType === 'rider' && !selectedBikeId) {
      alert('Please select a bike');
      return;
    }

    setActionLoading(true);
    try {
      const response = await requestService.sendRequest(
        id, 
        requestMessage, 
        joinType === 'passenger' ? seatsRequested : 0
      );
      
      console.log('Join request response:', response);
      
      if (response.success) {
        alert(`Request sent successfully as ${joinType}!`);
        setShowJoinModal(false);
        setJoinType(null);
        setRequestMessage('');
        setSeatsRequested(1);
        setSelectedBikeId('');
        refreshAll();
      } else {
        alert(response.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Join request error:', error);
      alert('Failed to send request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await requestService.getRequestsByRide(id);
      console.log('View requests response:', response);
      if (response.success) {
        setIncomingRequests(response.data || []);
        setShowRequestsModal(true);
      } else {
        alert(response.error || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error viewing requests:', error);
      alert('Failed to fetch requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setActionLoading(true);
    try {
      const response = await requestService.approveRequest(requestId);
      if (response.success) {
        alert('Request approved!');
        const refreshed = await requestService.getRequestsByRide(id);
        if (refreshed.success) {
          setIncomingRequests(refreshed.data || []);
        }
        refreshAll();
      } else {
        alert(response.error || 'Failed to approve');
      }
    } catch (error) {
      alert('Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading(true);
    try {
      const response = await requestService.rejectRequest(requestId);
      if (response.success) {
        alert('Request rejected');
        const refreshed = await requestService.getRequestsByRide(id);
        if (refreshed.success) {
          setIncomingRequests(refreshed.data || []);
        }
      } else {
        alert(response.error || 'Failed to reject');
      }
    } catch (error) {
      alert('Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const response = await chatService.sendMessage(id, newMessage);
      console.log('Send message response:', response);
      if (response.success) {
        setNewMessage('');
        await fetchMessages();
      } else {
        alert(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCancelRide = async () => {
    if (!confirm('Cancel this ride? All participants will be notified.')) return;
    
    setActionLoading(true);
    try {
      const response = await rideService.cancelRide(id);
      if (response.success) {
        alert('Ride cancelled');
        navigate(ROUTES.PROTECTED.MY_RIDES.path);
      } else {
        alert(response.error || 'Failed to cancel');
      }
    } catch (error) {
      alert('Failed to cancel ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRide = async () => {
    if (!confirm('Permanently delete this ride?')) return;
    
    setActionLoading(true);
    try {
      const response = await rideService.deleteRide(id);
      if (response.success) {
        alert('Ride deleted');
        navigate(ROUTES.PROTECTED.MY_RIDES.path);
      } else {
        alert(response.error || 'Failed to delete');
      }
    } catch (error) {
      alert('Failed to delete ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('Link copied!');
  };

  const StatBadge = ({ icon: Icon, label, value, color = 'primary' }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-dark-bg/50 rounded-lg">
      <Icon className={`w-4 h-4 text-${color}`} />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-12">
        <FaMotorcycle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Ride Not Found</h2>
        <Button onClick={() => navigate('/find-ride')}>Find Rides</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-dark-bg/95 backdrop-blur-lg py-4 -mx-4 px-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <h1 className="text-xl font-bold text-white truncate max-w-md">
              {ride.source} → {ride.destination}
            </h1>
            {statusConfig && (
              <Badge variant={statusConfig.color?.toLowerCase()} size="md">
                {statusConfig.label}
              </Badge>
            )}
            {isOwner && <Badge variant="primary">My Ride</Badge>}
            {isParticipant && !isOwner && <Badge variant="success">Joined</Badge>}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<FiRefreshCw className={refreshing ? 'animate-spin' : ''} />} onClick={refreshAll}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<FiShare2 />} onClick={handleCopyLink}>
              Share
            </Button>
            {canEdit && (
              <Button variant="outline" size="sm" leftIcon={<FiEdit2 />} onClick={() => navigate(`/rides/${id}/edit`)}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Request Status */}
      {!isOwner && myRequest && (
        <div className={`p-4 rounded-xl flex items-center justify-between ${
          isRequestPending ? 'bg-warning/10 border border-warning/30' :
          isRequestApproved ? 'bg-success/10 border border-success/30' :
          'bg-error/10 border border-error/30'
        }`}>
          <div className="flex items-center gap-3">
            {isRequestPending && <FiClock className="w-5 h-5 text-warning" />}
            {isRequestApproved && <FiCheckCircle className="w-5 h-5 text-success" />}
            <div>
              <p className="font-medium text-white">
                {isRequestPending && 'Request Pending'}
                {isRequestApproved && 'Request Approved!'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Card */}
          <Card>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <div className="w-0.5 h-16 bg-dark-border my-1" />
                <div className="w-4 h-4 rounded-full bg-accent" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">From</p>
                  <p className="text-xl font-semibold text-white">{ride.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">To</p>
                  <p className="text-xl font-semibold text-white">{ride.destination}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatBadge icon={FiCalendar} label="Date" value={formatDate.short(ride.dateTime)} />
              <StatBadge icon={FiClock} label="Time" value={formatDate.time(ride.dateTime)} />
              <StatBadge icon={FiUsers} label="Seats" value={`${ride.availableSeats}/${ride.totalSeats}`} color={isFull ? 'error' : 'primary'} />
              <StatBadge icon={FiDollarSign} label="Cost" value={formatCurrency.standard(ride.costPerPerson)} color="accent" />
            </div>
          </Card>

          {/* Chat Section */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiMessageCircle className="w-5 h-5 text-primary" />
                Group Chat {canChat && <Badge size="sm" variant="success">Active</Badge>}
              </h3>
              <button onClick={() => setShowChat(!showChat)}>
                {showChat ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            
            {showChat && (
              <>
                {!canChat ? (
                  <div className="text-center py-8">
                    <FiMessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-400">Join this ride to access the group chat</p>
                  </div>
                ) : (
                  <>
                    <div className="h-64 overflow-y-auto space-y-3 mb-4 p-2">
                      {messages.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No messages yet</p>
                      ) : (
                        messages.map((msg) => {
                          const isOwn = msg.sender?.id === user?.id;
                          return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                              {!isOwn && <Avatar src={msg.sender?.avatar} name={msg.sender?.name} size="sm" />}
                              <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                                {!isOwn && <p className="text-xs text-gray-400 mb-1 ml-1">{msg.sender?.name}</p>}
                                <div className={`px-4 py-2 rounded-2xl ${
                                  isOwn ? 'bg-primary text-white' : 'bg-dark-bg text-gray-200'
                                }`}>
                                  <p className="text-sm">{msg.content}</p>
                                </div>
                                <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                                  {formatDate.time(msg.timestamp)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button variant="primary" onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}>
                        <FiSend className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Owner Card */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Ride Owner</h3>
            <div className="flex items-center gap-4">
              <Avatar src={ride.owner?.avatar} name={ride.owner?.name} size="xl" />
              <div>
                <p className="text-white font-semibold">{ride.owner?.name}</p>
                {ride.owner?.rating && (
                  <p className="text-yellow-500 flex items-center gap-1">
                    <FiStar className="fill-current" /> {ride.owner.rating.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Participants Card - VISIBLE TO ALL */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Participants ({totalParticipants})
              </h3>
              <button onClick={() => setShowParticipants(!showParticipants)}>
                {showParticipants ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            
            {showParticipants && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {/* Bikers Section */}
                {bikeParticipants.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <FaMotorcycle className="w-3 h-3 text-primary" /> 
                      BIKERS ({bikeParticipants.length})
                    </p>
                    {bikeParticipants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                        <Avatar src={p.avatar} name={p.name} size="md" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {p.name} {p.id === user?.id && <span className="text-gray-400">(You)</span>}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FaMotorcycle className="w-3 h-3" />
                            {p.role === 'owner' ? 'Ride Owner' : 'Rider'}
                            {p.bike?.model && ` • ${p.bike.model}`}
                          </p>
                        </div>
                        {p.phone && p.id !== user?.id && (
                          <button 
                            className="p-2 text-gray-400 hover:text-primary"
                            onClick={() => window.location.href = `tel:${p.phone}`}
                          >
                            <FiPhone className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </>
                )}
                
                {/* Passengers Section */}
                {participants.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-3">
                      <FiUser className="w-3 h-3 text-accent" /> 
                      PASSENGERS ({participants.length})
                    </p>
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-card/50">
                        <Avatar src={p.avatar} name={p.name} size="md" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {p.name} {p.id === user?.id && <span className="text-gray-400">(You)</span>}
                          </p>
                          <p className="text-xs text-gray-400">
                            Passenger • {p.seats} seat(s)
                          </p>
                        </div>
                        {p.phone && p.id !== user?.id && (
                          <button 
                            className="p-2 text-gray-400 hover:text-primary"
                            onClick={() => window.location.href = `tel:${p.phone}`}
                          >
                            <FiPhone className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </>
                )}
                
                {totalParticipants === 0 && (
                  <p className="text-gray-400 text-center py-4">No participants yet</p>
                )}
              </div>
            )}
          </Card>

          {/* Actions Card */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              {canJoin && (
                <Button variant="primary" fullWidth size="lg" onClick={handleOpenJoinModal} leftIcon={<FiUserPlus />}>
                  Join This Ride
                </Button>
              )}
              
              {isRequestPending && (
                <div className="text-center p-3 bg-warning/10 rounded-lg">
                  <FiClock className="w-5 h-5 text-warning mx-auto mb-1" />
                  <p className="text-warning font-medium">Request Pending</p>
                </div>
              )}
              
              {canViewRequests && (
                <Button variant="outline" fullWidth leftIcon={<FiUsers />} onClick={handleViewRequests}>
                  View Requests
                </Button>
              )}
              
              {canCancel && (
                <Button variant="ghost" fullWidth leftIcon={<FiXCircle />} onClick={handleCancelRide} className="text-warning">
                  Cancel Ride
                </Button>
              )}
              
              {canDelete && (
                <Button variant="ghost" fullWidth leftIcon={<FiTrash2 />} onClick={handleDeleteRide} className="text-error">
                  Delete Ride
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Join Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join This Ride" size="md">
        <div className="space-y-4">
          <p className="text-gray-300">How would you like to join?</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setJoinType('passenger')}
              className={`p-4 rounded-xl border-2 transition-all ${
                joinType === 'passenger'
                  ? 'border-primary bg-primary/10'
                  : 'border-dark-border hover:border-gray-500'
              }`}
            >
              <FiUser className="w-8 h-8 text-primary mb-2" />
              <p className="text-white font-semibold">As Passenger</p>
              <p className="text-sm text-gray-400">Share the ride cost</p>
            </button>
            
            <button
              onClick={() => setJoinType('rider')}
              disabled={!canJoinAsRider}
              className={`p-4 rounded-xl border-2 transition-all ${
                !canJoinAsRider
                  ? 'border-dark-border opacity-50 cursor-not-allowed'
                  : joinType === 'rider'
                    ? 'border-primary bg-primary/10'
                    : 'border-dark-border hover:border-gray-500'
              }`}
            >
              <FaMotorcycle className="w-8 h-8 text-primary mb-2" />
              <p className="text-white font-semibold">As Rider</p>
              <p className="text-sm text-gray-400">Join with your bike</p>
              {!canJoinAsRider && (
                <p className="text-xs text-warning mt-1">Add a bike first</p>
              )}
            </button>
          </div>
          
          {joinType === 'passenger' && (
            <div className="space-y-3 pt-3 border-t border-dark-border">
              <Input
                name="seats"
                type="number"
                label="Number of Seats"
                value={seatsRequested}
                onChange={(e) => setSeatsRequested(parseInt(e.target.value) || 1)}
                min={1}
                max={ride.availableSeats}
              />
              <Input
                name="message"
                type="textarea"
                label="Message (Optional)"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}
          
          {joinType === 'rider' && (
            <div className="space-y-3 pt-3 border-t border-dark-border">
              <Input
                name="bikeId"
                type="select"
                label="Select Your Bike"
                value={selectedBikeId}
                onChange={(e) => setSelectedBikeId(e.target.value)}
                options={[
                  { value: '', label: 'Select a bike', disabled: true },
                  ...userBikes.map(bike => ({
                    value: bike.id,
                    label: `${bike.model} - ${bike.registrationNumber}`
                  }))
                ]}
              />
              <Input
                name="message"
                type="textarea"
                label="Message (Optional)"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowJoinModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              fullWidth 
              loading={actionLoading} 
              onClick={handleJoinRequest}
              disabled={!joinType || (joinType === 'rider' && !selectedBikeId)}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Requests Modal */}
      <Modal isOpen={showRequestsModal} onClose={() => setShowRequestsModal(false)} title="Incoming Requests" size="md">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loadingRequests ? (
            <div className="flex justify-center py-8">
              <FiLoader className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : incomingRequests.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No requests yet</p>
          ) : (
            incomingRequests.map(req => (
              <div key={req.id} className="p-4 bg-dark-bg/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={req.user?.avatar} name={req.user?.name} size="md" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{req.user?.name}</p>
                    <Badge size="sm">{req.seatsRequested} seat(s)</Badge>
                    <Badge variant={req.status === 'PENDING' ? 'warning' : req.status === 'APPROVED' ? 'success' : 'error'} size="sm" className="ml-2">
                      {req.status}
                    </Badge>
                  </div>
                </div>
                {req.message && <p className="text-sm text-gray-300 mb-3">"{req.message}"</p>}
                {req.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" leftIcon={<FiCheck />} onClick={() => handleApproveRequest(req.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="ghost" leftIcon={<FiX />} onClick={() => handleRejectRequest(req.id)}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RideDetails;