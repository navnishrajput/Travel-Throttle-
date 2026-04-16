/**
 * CHAT WINDOW COMPONENT
 * Real-time chat interface for ride groups
 */

import { useState, useRef, useEffect } from 'react';
import { cn, formatDate, getInitials } from '../../utils/helpers';
import { THEME } from '../../constants';
import { Avatar, Button, Input } from '../common';
import { 
  FiSend, 
  FiImage, 
  FiMoreVertical,
  FiUserPlus,
  FiInfo
} from 'react-icons/fi';

/**
 * ChatWindow Component
 * @param {Object} props - Component props
 * @param {Object} props.ride - Ride data
 * @param {Array} props.messages - Chat messages
 * @param {Array} props.participants - Ride participants
 * @param {Function} props.onSendMessage - Send message handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional classes
 */
export const ChatWindow = ({ 
  ride,
  messages = [],
  participants = [],
  onSendMessage,
  loading = false,
  className = '' 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSend = () => {
    if (newMessage.trim() && !loading) {
      onSendMessage?.(newMessage.trim());
      setNewMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const renderMessage = (message, index) => {
    const isSystem = message.type === 'SYSTEM';
    const isOwn = message.sender?.id === 'user-1'; // Will check against actual user
    const showAvatar = !isOwn && !isSystem && 
      messages[index - 1]?.sender?.id !== message.sender?.id;
    
    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center my-3">
          <span className="px-3 py-1 bg-dark-bg/50 rounded-full text-xs text-gray-400">
            {message.content}
          </span>
        </div>
      );
    }
    
    return (
      <div 
        key={message.id}
        className={cn(
          'flex items-end gap-2 mb-3',
          isOwn && 'flex-row-reverse'
        )}
      >
        {/* Avatar */}
        {!isOwn && (
          <div className="flex-shrink-0">
            {showAvatar ? (
              <Avatar 
                src={message.sender?.avatar} 
                name={message.sender?.name}
                size="sm"
              />
            ) : (
              <div className="w-8" />
            )}
          </div>
        )}
        
        {/* Message Content */}
        <div className={cn(
          'max-w-[70%]',
          isOwn && 'items-end'
        )}>
          {/* Sender Name */}
          {!isOwn && showAvatar && (
            <p className="text-xs text-gray-400 mb-1 ml-1">
              {message.sender?.name}
            </p>
          )}
          
          {/* Message Bubble */}
          <div className={cn(
            'px-4 py-2 rounded-2xl',
            isOwn 
              ? 'bg-primary text-white rounded-br-sm' 
              : 'bg-dark-card text-gray-200 rounded-bl-sm'
          )}>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          
          {/* Timestamp */}
          <p className={cn(
            'text-xs text-gray-500 mt-1',
            isOwn ? 'text-right mr-1' : 'ml-1'
          )}>
            {formatDate.time(message.timestamp)}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className={cn('flex flex-col h-full bg-dark-bg rounded-xl overflow-hidden border border-dark-border', className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-card border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={ride?.destination || 'Group'} size="md" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-dark-card" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {ride?.destination || 'Ride Group'}
            </h3>
            <p className="text-xs text-gray-400">
              {participants.length} participants • {ride?.source || 'Loading...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors"
            aria-label="Show participants"
          >
            <FiUserPlus className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors">
            <FiInfo className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Chat Body */}
      <div className="flex-1 overflow-hidden flex">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 mb-3 rounded-full bg-dark-card flex items-center justify-center">
                <FiSend className="w-6 h-6" />
              </div>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => renderMessage(message, index))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 border-l border-dark-border bg-dark-card/50 p-3">
            <h4 className="text-sm font-semibold text-white mb-3">
              Participants ({participants.length})
            </h4>
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-bg transition-colors">
                  <Avatar 
                    src={participant.avatar} 
                    name={participant.name}
                    size="sm"
                    status={participant.status || 'online'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{participant.name}</p>
                    {participant.isOwner && (
                      <p className="text-xs text-primary">Ride Owner</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 bg-dark-card border-t border-dark-border">
        <div className="flex items-end gap-2">
          <button className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-bg transition-colors">
            <FiImage className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <Input
              ref={inputRef}
              type="textarea"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="resize-none"
              disabled={loading}
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || loading}
            loading={loading}
            className="p-3"
          >
            <FiSend className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;