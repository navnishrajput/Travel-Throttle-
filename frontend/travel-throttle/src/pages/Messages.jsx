/**
 * MESSAGES PAGE - Modern Redesign
 * Enhanced group chat with professional styling and animations
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services/rideService';
import { requestService } from '../services/requestService';
import { chatService } from '../services/chatService';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Card, Button, Avatar, Badge } from '../components/common';
import { 
  FiSend, FiUsers, FiInfo, FiSearch, FiImage, FiMapPin as FiMapPinIcon,
  FiMessageCircle, FiCalendar, FiClock, FiX, FiRefreshCw,
  FiChevronRight, FiNavigation, FiPhone,
  FiChevronLeft, FiSmile, FiCheck, FiInbox
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

export const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myRides, setMyRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [bikeParticipants, setBikeParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showRideInfo, setShowRideInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatIntervalRef = useRef(null);
  
  const queryParams = new URLSearchParams(location.search);
  const rideIdFromQuery = queryParams.get('rideId');
  
  // Auto-refresh messages
  useEffect(() => {
    if (selectedRide) {
      fetchMessages(selectedRide.id);
      chatIntervalRef.current = setInterval(() => {
        fetchMessages(selectedRide.id, true);
      }, 3000);
    }
    return () => {
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
    };
  }, [selectedRide]);
  
  useEffect(() => {
    fetchMyRides();
  }, []);
  
  useEffect(() => {
    if (rideIdFromQuery && myRides.length > 0) {
      const ride = myRides.find(r => r.id === rideIdFromQuery);
      if (ride) {
        setSelectedRide(ride);
        setShowMobileSidebar(false);
      }
    }
  }, [rideIdFromQuery, myRides]);
  
  useEffect(() => {
    if (selectedRide) {
      fetchMessages(selectedRide.id);
      fetchAllParticipants(selectedRide.id);
    }
  }, [selectedRide]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchMyRides = async () => {
    setLoading(true);
    try {
      const response = await rideService.getMyRides();
      if (response.success) {
        const rides = response.data || [];
        const activeRides = rides.filter(ride => 
          ride.status === 'UPCOMING' || ride.status === 'ONGOING'
        );
        setMyRides(activeRides);
        
        if (activeRides.length === 1 && !selectedRide) {
          setSelectedRide(activeRides[0]);
          setShowMobileSidebar(false);
        }
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (rideId, silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const response = await chatService.getMessages(rideId);
      if (response.success) {
        const newMessages = response.data || [];
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const fetchAllParticipants = async (rideId) => {
    try {
      const rideResponse = await rideService.getRideById(rideId);
      
      const bikeParticipantsList = [];
      const passengerParticipantsList = [];
      
      if (rideResponse.success && rideResponse.data) {
        const ride = rideResponse.data;
        
        if (ride.owner) {
          bikeParticipantsList.push({
            id: ride.owner.id,
            name: ride.owner.name,
            avatar: ride.owner.avatar,
            role: 'owner',
            phone: ride.owner.phone,
            bike: ride.bike
          });
        }
      }
      
      try {
        const requestsResponse = await requestService.getRequestsByRide(rideId);
        
        if (requestsResponse.success && requestsResponse.data) {
          const approvedRequests = requestsResponse.data.filter(
            req => req.status === 'APPROVED'
          );
          
          approvedRequests.forEach(req => {
            if (req.user) {
              passengerParticipantsList.push({
                id: req.user.id,
                name: req.user.name,
                avatar: req.user.avatar,
                role: 'passenger',
                seats: req.seatsRequested,
                phone: req.user.phone
              });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
      
      setBikeParticipants(bikeParticipantsList);
      setParticipants(passengerParticipantsList);
      
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRide || sending) return;
    
    setSending(true);
    try {
      const response = await chatService.sendMessage(selectedRide.id, newMessage);
      if (response.success) {
        setNewMessage('');
        await fetchMessages(selectedRide.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  const renderMessageContent = (msg) => {
    if (msg.type === 'IMAGE' && msg.attachmentUrl) {
      return (
        <div>
          <img 
            src={msg.attachmentUrl} 
            alt="Shared" 
            className="max-w-full max-h-60 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
            onClick={() => window.open(msg.attachmentUrl, '_blank')}
          />
          {msg.content !== '[Image]' && <p className="text-sm mt-2">{msg.content}</p>}
        </div>
      );
    }
    
    if (msg.isSystemMessage) {
      return (
        <div className="flex justify-center my-4">
          <span className="px-5 py-2 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm rounded-full text-xs text-text-secondary font-medium border border-white/10 shadow-lg">
            {msg.content}
          </span>
        </div>
      );
    }
    
    return <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>;
  };
  
  const filteredRides = myRides.filter(ride => 
    ride.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalParticipants = bikeParticipants.length + participants.length;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-100px)] flex gap-4 relative">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center text-white hover:scale-110 transition-all duration-300"
      >
        {showMobileSidebar ? <FiChevronLeft className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
      </button>
      
      {/* Rides Sidebar */}
      <Card className={`w-80 flex flex-col glass-card transition-all duration-300 ${
        showMobileSidebar ? 'lg:translate-x-0 translate-x-0' : 'lg:translate-x-0 -translate-x-full'
      } fixed lg:relative z-40 h-[calc(100vh-120px)] lg:h-full shadow-2xl`}>
        <div className="p-5 border-b border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-heading">
            <div className="p-2 bg-primary/20 rounded-xl">
              <FaMotorcycle className="text-primary w-5 h-5" />
            </div>
            Your Rides
            <Badge variant="primary" size="sm" className="ml-auto">{myRides.length}</Badge>
          </h2>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              placeholder="Search rides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-bg-tertiary border-2 border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 pl-11 text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredRides.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <FiMessageCircle className="w-8 h-8 text-primary opacity-40" />
              </div>
              <p className="text-text-secondary font-medium">No active rides</p>
              <p className="text-text-muted text-xs mt-2">Create or join a ride to start chatting</p>
            </div>
          ) : (
            filteredRides.map(ride => (
              <div
                key={ride.id}
                onClick={() => {
                  setSelectedRide(ride);
                  setShowRideInfo(false);
                  setShowParticipants(false);
                  setShowMobileSidebar(false);
                }}
                className={`p-4 cursor-pointer transition-all duration-300 rounded-xl mb-2 group ${
                  selectedRide?.id === ride.id 
                    ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-l-4 border-l-primary shadow-lg' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    selectedRide?.id === ride.id 
                      ? 'bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30' 
                      : 'bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30'
                  }`}>
                    <FaMotorcycle className={`w-6 h-6 ${selectedRide?.id === ride.id ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{ride.destination}</p>
                    <p className="text-xs text-text-secondary truncate flex items-center gap-1 mt-0.5">
                      <FiMapPinIcon className="w-3 h-3" /> {ride.source}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge size="sm" variant={ride.status === 'ONGOING' ? 'success' : 'info'} className="text-xs">
                        {ride.status}
                      </Badge>
                      <span className="text-xs text-text-muted">{formatDate.short(ride.dateTime)}</span>
                    </div>
                  </div>
                  <FiChevronRight className={`w-5 h-5 transition-all duration-300 ${
                    selectedRide?.id === ride.id ? 'text-primary translate-x-1' : 'text-text-muted'
                  }`} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      
      {/* Chat Area */}
      <Card className="flex-1 flex flex-col glass-card overflow-hidden shadow-2xl">
        {selectedRide ? (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-dark-bg/50 via-dark-card/30 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <FiChevronLeft className="w-5 h-5 text-text-secondary" />
                  </button>
                  <div className="relative">
                    <Avatar name={selectedRide.destination} size="md" className="ring-2 ring-primary/20" />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-dark-card ${
                      selectedRide.status === 'ONGOING' ? 'bg-success animate-pulse' : 'bg-text-muted'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold font-heading text-lg">{selectedRide.destination}</h3>
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-0.5">
                      <span className="flex items-center gap-1">
                        <FiMapPinIcon className="w-3 h-3 text-primary" /> {selectedRide.source}
                      </span>
                      <span className="w-1 h-1 bg-text-muted rounded-full" />
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-primary" /> {formatDate.short(selectedRide.dateTime)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Badge variant={selectedRide.status === 'ONGOING' ? 'success' : 'info'} size="md" className="hidden sm:flex">
                    {selectedRide.status}
                  </Badge>
                  <button
                    onClick={() => {
                      setShowParticipants(!showParticipants);
                      setShowRideInfo(false);
                    }}
                    className={`p-2.5 rounded-xl transition-all duration-200 relative group ${
                      showParticipants 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                    title="Participants"
                  >
                    <FiUsers className="w-5 h-5" />
                    {totalParticipants > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary to-secondary rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg">
                        {totalParticipants}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowRideInfo(!showRideInfo);
                      setShowParticipants(false);
                    }}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      showRideInfo 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                    title="Ride Info"
                  >
                    <FiInfo className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => fetchMessages(selectedRide.id)}
                    className="p-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
                    title="Refresh"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent via-dark-bg/10 to-transparent">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 animate-float">
                      <FiMessageCircle className="w-12 h-12 text-primary opacity-60" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-heading mb-2">No messages yet</h3>
                    <p className="text-text-secondary max-w-xs">
                      Start the conversation! Share your excitement about the upcoming ride.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    if (msg.isSystemMessage) {
                      return (
                        <div key={msg.id}>
                          {renderMessageContent(msg)}
                        </div>
                      );
                    }
                    
                    const isOwn = msg.sender?.id === user?.id || msg.isOwn;
                    const showAvatar = !isOwn && messages[idx - 1]?.sender?.id !== msg.sender?.id;
                    
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''} animate-slide-up`}>
                        {!isOwn && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar src={msg.sender?.avatar} name={msg.sender?.name} size="sm" className="ring-2 ring-primary/10" />
                            ) : (
                              <div className="w-8" />
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                          {!isOwn && showAvatar && (
                            <p className="text-xs text-text-secondary mb-1.5 ml-1 font-medium">{msg.sender?.name}</p>
                          )}
                          <div className={`px-5 py-3 rounded-2xl shadow-lg ${
                            isOwn 
                              ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-md' 
                              : 'bg-dark-card border border-white/10 text-text-primary rounded-bl-md'
                          }`}>
                            {renderMessageContent(msg)}
                          </div>
                          <div className={`flex items-center gap-1 mt-1.5 ${isOwn ? 'justify-end mr-1' : 'ml-1'}`}>
                            <p className="text-xs text-text-muted">
                              {formatDate.time(msg.timestamp)}
                            </p>
                            {isOwn && (
                              <FiCheck className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Right Sidebar - Participants */}
              {showParticipants && (
                <div className="w-80 border-l border-white/10 bg-dark-bg/30 backdrop-blur-sm overflow-y-auto animate-slide-left">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="font-bold text-white font-heading text-lg flex items-center gap-2">
                        <FiUsers className="text-primary w-5 h-5" />
                        Participants
                        <Badge variant="primary" size="sm">{totalParticipants}</Badge>
                      </h4>
                      <button
                        onClick={() => setShowParticipants(false)}
                        className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Bikers Section */}
                      {bikeParticipants.length > 0 && (
                        <>
                          <p className="text-xs text-text-secondary font-semibold flex items-center gap-2 uppercase tracking-wider">
                            <div className="p-1.5 bg-primary/20 rounded-lg">
                              <FaMotorcycle className="w-3 h-3 text-primary" />
                            </div>
                            BIKERS ({bikeParticipants.length})
                          </p>
                          <div className="space-y-2">
                            {bikeParticipants.map(p => (
                              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/10 group hover:border-primary/30 transition-all duration-200">
                                <Avatar src={p.avatar} name={p.name} size="md" className="ring-2 ring-primary/20" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-semibold truncate">
                                    {p.name}
                                    {p.id === user?.id && <span className="text-text-muted ml-1 text-xs font-normal">(You)</span>}
                                  </p>
                                  <p className="text-xs text-text-secondary flex items-center gap-1">
                                    <FaMotorcycle className="w-3 h-3" />
                                    {p.role === 'owner' ? 'Ride Owner' : 'Rider'}
                                    {p.bike?.model && <span className="truncate"> • {p.bike.model}</span>}
                                  </p>
                                </div>
                                {p.phone && p.id !== user?.id && (
                                  <button 
                                    className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 transition-all duration-200"
                                    onClick={() => window.location.href = `tel:${p.phone}`}
                                    title="Call"
                                  >
                                    <FiPhone className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* Passengers Section */}
                      {participants.length > 0 && (
                        <>
                          <p className="text-xs text-text-secondary font-semibold flex items-center gap-2 uppercase tracking-wider mt-4">
                            <div className="p-1.5 bg-accent/20 rounded-lg">
                              <FiUsers className="w-3 h-3 text-accent" />
                            </div>
                            PASSENGERS ({participants.length})
                          </p>
                          <div className="space-y-2">
                            {participants.map(p => (
                              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all duration-200">
                                <Avatar src={p.avatar} name={p.name} size="md" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">
                                    {p.name}
                                    {p.id === user?.id && <span className="text-text-muted ml-1 text-xs font-normal">(You)</span>}
                                  </p>
                                  <p className="text-xs text-text-secondary">
                                    Passenger • {p.seats} seat{p.seats > 1 ? 's' : ''}
                                  </p>
                                </div>
                                {p.phone && p.id !== user?.id && (
                                  <button 
                                    className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 transition-all duration-200"
                                    onClick={() => window.location.href = `tel:${p.phone}`}
                                    title="Call"
                                  >
                                    <FiPhone className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {totalParticipants === 0 && (
                        <div className="text-center py-8">
                          <FiUsers className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-40" />
                          <p className="text-text-secondary">No participants yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ride Info Sidebar */}
              {showRideInfo && (
                <div className="w-80 border-l border-white/10 bg-dark-bg/30 backdrop-blur-sm overflow-y-auto animate-slide-left">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="font-bold text-white font-heading text-lg">Ride Details</h4>
                      <button
                        onClick={() => setShowRideInfo(false)}
                        className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-5 bg-gradient-to-br from-dark-card/50 to-dark-card/30 rounded-2xl border border-white/5">
                        <p className="text-xs text-text-secondary mb-3 font-medium uppercase tracking-wider">Route</p>
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
                            <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-accent my-1.5" />
                            <div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <p className="text-white font-semibold">{selectedRide.source}</p>
                              <p className="text-text-muted text-xs">Starting Point</p>
                            </div>
                            <div>
                              <p className="text-white font-semibold">{selectedRide.destination}</p>
                              <p className="text-text-muted text-xs">Destination</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gradient-to-br from-dark-card/50 to-dark-card/30 rounded-xl border border-white/5">
                          <p className="text-xs text-text-secondary mb-1">Date</p>
                          <p className="text-white font-semibold text-sm">{formatDate.short(selectedRide.dateTime)}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-dark-card/50 to-dark-card/30 rounded-xl border border-white/5">
                          <p className="text-xs text-text-secondary mb-1">Time</p>
                          <p className="text-white font-semibold text-sm">{formatDate.time(selectedRide.dateTime)}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-dark-card/50 to-dark-card/30 rounded-xl border border-white/5">
                          <p className="text-xs text-text-secondary mb-1">Seats</p>
                          <p className="text-white font-semibold text-sm">{selectedRide.availableSeats}/{selectedRide.totalSeats}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-dark-card/50 to-dark-card/30 rounded-xl border border-white/5">
                          <p className="text-xs text-text-secondary mb-1">Cost</p>
                          <p className="text-accent font-semibold text-sm">{formatCurrency.standard(selectedRide.costPerPerson)}</p>
                        </div>
                      </div>
                      
                      {selectedRide.description && (
                        <div className="p-4 bg-gradient-to-br from-dark-card/50 to-dark-card/30 rounded-xl border border-white/5">
                          <p className="text-xs text-text-secondary mb-2 font-medium uppercase tracking-wider">Description</p>
                          <p className="text-text-primary text-sm leading-relaxed">{selectedRide.description}</p>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={() => navigate(`/rides/${selectedRide.id}`)}
                        className="border-2 border-white/20 hover:border-primary/50 hover:bg-primary/5 backdrop-blur-sm mt-4"
                      >
                        View Full Ride Details
                        <FiChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-5 border-t border-white/10 bg-gradient-to-r from-dark-bg/50 via-dark-card/30 to-transparent">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 p-3 bg-dark-bg/50 rounded-xl border border-white/10 flex items-center justify-between animate-slide-up">
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover" />
                    <span className="text-sm text-text-secondary">Image ready to send</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-end gap-3">
                <div className="flex gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    title="Send Image"
                  >
                    <FiImage className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex-1 relative">
                  <input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-dark-bg-tertiary border-2 border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 pr-12"
                    disabled={sending}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-primary transition-colors"
                    title="Add emoji"
                  >
                    <FiSmile className="w-5 h-5" />
                  </button>
                </div>
                
                <Button 
                  variant="primary" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  loading={sending}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 p-3 rounded-xl"
                >
                  <FiSend className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 animate-float">
              <FiInbox className="w-14 h-14 text-primary opacity-60" />
            </div>
            <h2 className="text-2xl font-bold text-white font-heading mb-3">No Conversation Selected</h2>
            <p className="text-text-secondary max-w-md mb-6">
              Choose a ride from the sidebar to start chatting with your fellow riders
            </p>
            <Button
              variant="outline"
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden border-2 border-white/20 hover:border-primary/50"
            >
              <FiMessageCircle className="w-4 h-4 mr-2" />
              Select a Ride
            </Button>
          </div>
        )}
      </Card>
      
      {/* Overlay for mobile */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
    </div>
  );
};

export default Messages;