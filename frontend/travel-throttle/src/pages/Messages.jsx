/**
 * MESSAGES PAGE
 * Enhanced group chat with proper participants display for all users
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services/rideService';
import { requestService } from '../services/requestService';
import { chatService } from '../services/chatService';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Card, Input, Button, Avatar, Badge } from '../components/common';
import { 
  FiSend, FiUsers, FiInfo, FiSearch, FiImage, FiMapPin as FiMapPinIcon,
  FiMessageCircle, FiCalendar, FiClock, FiX, FiRefreshCw,
  FiChevronRight, FiNavigation, FiPhone
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
      console.log('My rides response:', response);
      if (response.success) {
        const rides = response.data || [];
        const activeRides = rides.filter(ride => 
          ride.status === 'UPCOMING' || ride.status === 'ONGOING'
        );
        setMyRides(activeRides);
        
        if (activeRides.length === 1 && !selectedRide) {
          setSelectedRide(activeRides[0]);
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
      console.log('Messages response:', response);
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
  
  // CRITICAL FIX: Fetch ALL participants for the selected ride
  const fetchAllParticipants = async (rideId) => {
    console.log('=== FETCHING ALL PARTICIPANTS FOR MESSAGES ===', rideId);
    
    try {
      // Get ride details for owner info
      const rideResponse = await rideService.getRideById(rideId);
      console.log('Ride details:', rideResponse);
      
      const bikeParticipantsList = [];
      const passengerParticipantsList = [];
      
      if (rideResponse.success && rideResponse.data) {
        const ride = rideResponse.data;
        
        // Add owner
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
      
      // Fetch all approved requests for this ride
      try {
        const requestsResponse = await requestService.getRequestsByRide(rideId);
        console.log('Requests for ride:', requestsResponse);
        
        if (requestsResponse.success && requestsResponse.data) {
          const approvedRequests = requestsResponse.data.filter(
            req => req.status === 'APPROVED'
          );
          
          console.log('Approved requests found:', approvedRequests.length);
          
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
      
      console.log('Bike participants:', bikeParticipantsList.length);
      console.log('Passenger participants:', passengerParticipantsList.length);
      
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
            className="max-w-full max-h-60 rounded-xl cursor-pointer hover:opacity-90"
            onClick={() => window.open(msg.attachmentUrl, '_blank')}
          />
          {msg.content !== '[Image]' && <p className="text-sm mt-1">{msg.content}</p>}
        </div>
      );
    }
    
    if (msg.isSystemMessage) {
      return (
        <div className="flex justify-center my-2">
          <span className="px-4 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-xs text-gray-300">
            {msg.content}
          </span>
        </div>
      );
    }
    
    return <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>;
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
    <div className="h-[calc(100vh-100px)] flex gap-4">
      {/* Rides Sidebar */}
      <Card className="w-80 flex flex-col glass-card">
        <div className="p-4 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaMotorcycle className="text-primary" />
            Your Rides
          </h2>
          <Input
            placeholder="Search rides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FiSearch className="w-4 h-4" />}
            className="bg-dark-bg/50"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredRides.length === 0 ? (
            <div className="text-center py-8">
              <FiMessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
              <p className="text-gray-400">No active rides</p>
            </div>
          ) : (
            filteredRides.map(ride => (
              <div
                key={ride.id}
                onClick={() => {
                  setSelectedRide(ride);
                  setShowRideInfo(false);
                  setShowParticipants(false);
                }}
                className={`p-4 cursor-pointer transition-all border-b border-dark-border last:border-0 ${
                  selectedRide?.id === ride.id 
                    ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-l-primary' 
                    : 'hover:bg-dark-bg/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <FiMessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{ride.destination}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <FiMapPinIcon className="w-3 h-3" /> {ride.source}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge size="sm" variant={ride.status === 'ONGOING' ? 'success' : 'info'}>
                        {ride.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatDate.short(ride.dateTime)}</span>
                    </div>
                  </div>
                  <FiChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      
      {/* Chat Area */}
      <Card className="flex-1 flex flex-col glass-card overflow-hidden">
        {selectedRide ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-border flex items-center justify-between bg-gradient-to-r from-dark-bg/50 to-transparent">
              <div className="flex items-center gap-3">
                <Avatar name={selectedRide.destination} size="md" />
                <div>
                  <h3 className="text-white font-semibold">{selectedRide.destination}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiMapPinIcon className="w-3 h-3" /> {selectedRide.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" /> {formatDate.short(selectedRide.dateTime)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Badge variant={selectedRide.status === 'ONGOING' ? 'success' : 'info'}>
                  {selectedRide.status}
                </Badge>
                <button
                  onClick={() => {
                    setShowParticipants(!showParticipants);
                    setShowRideInfo(false);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors relative"
                  title="Participants"
                >
                  <FiUsers className="w-5 h-5" />
                  {totalParticipants > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-xs flex items-center justify-center">
                      {totalParticipants}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowRideInfo(!showRideInfo);
                    setShowParticipants(false);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors"
                  title="Ride Info"
                >
                  <FiInfo className="w-5 h-5" />
                </button>
                <button
                  onClick={() => fetchMessages(selectedRide.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors"
                  title="Refresh"
                >
                  <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FiMessageCircle className="w-10 h-10 text-primary opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-gray-300">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
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
                      <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {!isOwn && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar src={msg.sender?.avatar} name={msg.sender?.name} size="sm" />
                            ) : (
                              <div className="w-8" />
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                          {!isOwn && showAvatar && (
                            <p className="text-xs text-gray-400 mb-1 ml-1">{msg.sender?.name}</p>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl ${
                            isOwn 
                              ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-sm shadow-lg' 
                              : 'bg-dark-card text-gray-200 rounded-bl-sm'
                          }`}>
                            {renderMessageContent(msg)}
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                            {formatDate.time(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Right Sidebar - Participants */}
              {showParticipants && (
                <div className="w-72 border-l border-dark-border bg-dark-bg/30 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white">
                        Participants ({totalParticipants})
                      </h4>
                      <button
                        onClick={() => setShowParticipants(false)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Bikers Section */}
                      {bikeParticipants.length > 0 && (
                        <>
                          <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <FaMotorcycle className="w-3 h-3 text-primary" /> 
                            BIKERS ({bikeParticipants.length})
                          </p>
                          {bikeParticipants.map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                              <Avatar src={p.avatar} name={p.name} size="md" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {p.name}
                                  {p.id === user?.id && " (You)"}
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
                            <FiUsers className="w-3 h-3 text-accent" /> 
                            PASSENGERS ({participants.length})
                          </p>
                          {participants.map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-card/50">
                              <Avatar src={p.avatar} name={p.name} size="md" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {p.name}
                                  {p.id === user?.id && " (You)"}
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
                  </div>
                </div>
              )}
              
              {/* Ride Info Sidebar */}
              {showRideInfo && (
                <div className="w-72 border-l border-dark-border bg-dark-bg/30 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white">Ride Info</h4>
                      <button
                        onClick={() => setShowRideInfo(false)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-dark-card/50 rounded-xl">
                        <p className="text-xs text-gray-400 mb-1">Route</p>
                        <p className="text-white text-sm">{selectedRide.source}</p>
                        <FiNavigation className="w-4 h-4 text-primary my-1 mx-auto" />
                        <p className="text-white text-sm">{selectedRide.destination}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-dark-card/50 rounded-xl">
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="text-white text-sm">{formatDate.short(selectedRide.dateTime)}</p>
                        </div>
                        <div className="p-3 bg-dark-card/50 rounded-xl">
                          <p className="text-xs text-gray-400">Time</p>
                          <p className="text-white text-sm">{formatDate.time(selectedRide.dateTime)}</p>
                        </div>
                        <div className="p-3 bg-dark-card/50 rounded-xl">
                          <p className="text-xs text-gray-400">Seats</p>
                          <p className="text-white text-sm">{selectedRide.availableSeats}/{selectedRide.totalSeats}</p>
                        </div>
                        <div className="p-3 bg-dark-card/50 rounded-xl">
                          <p className="text-xs text-gray-400">Cost</p>
                          <p className="text-white text-sm">{formatCurrency.standard(selectedRide.costPerPerson)}</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={() => navigate(`/rides/${selectedRide.id}`)}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-dark-border bg-gradient-to-r from-dark-bg/30 to-transparent">
              <div className="flex gap-2">
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
                  title="Send Image"
                  className="hover:bg-primary/20"
                >
                  <FiImage className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-dark-bg/50"
                  disabled={sending}
                />
                <Button 
                  variant="primary" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  loading={sending}
                  className="btn-gradient"
                >
                  <FiSend className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
              <FiMessageCircle className="w-12 h-12 text-primary opacity-70" />
            </div>
            <p className="text-xl font-medium text-gray-300">Select a ride</p>
            <p className="text-sm mt-1">Choose from your active rides on the left</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Messages;