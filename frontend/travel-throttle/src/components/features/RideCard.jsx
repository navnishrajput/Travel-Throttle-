/**
 * RIDE CARD COMPONENT
 * Full functionality: Edit, Delete, Cancel, Join, Send Request, View Requests
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rideService } from '../../services/rideService';
import { requestService } from '../../services/requestService';
import { cn, formatDate, formatCurrency } from '../../utils/helpers';
import { RIDE_STATUS } from '../../constants';
import { Card, Badge, Button, Avatar, Modal, Input } from '../common';
import { 
  FiMapPin, FiCalendar, FiClock, FiUsers, FiDollarSign,
  FiNavigation, FiEdit2, FiTrash2, FiXCircle, FiSend, 
  FiCheck, FiX, FiUserPlus, FiEye, FiRefreshCw,
  FiLoader, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';

export const RideCard = ({ 
  ride,
  variant = 'default',
  showActions = true,
  onRefresh,
  className = '' 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [editForm, setEditForm] = useState({
    source: ride?.source || '',
    destination: ride?.destination || '',
    dateTime: ride?.dateTime || '',
    availableSeats: ride?.availableSeats || 1,
    totalSeats: ride?.totalSeats || 2,
    costPerPerson: ride?.costPerPerson || 0,
    distance: ride?.distance || '',
    duration: ride?.duration || '',
    description: ride?.description || '',
    allowFemaleOnly: ride?.allowFemaleOnly || false
  });

  if (!ride) return null;

  const {
    id,
    owner,
    source,
    destination,
    dateTime,
    availableSeats,
    totalSeats = 2,
    costPerPerson,
    status = 'UPCOMING'
  } = ride;

  const isFull = availableSeats === 0;
  const statusConfig = RIDE_STATUS[status] || RIDE_STATUS.UPCOMING;
  const seatsLeft = availableSeats;
  const isOwner = user?.id === owner?.id || ride?.isOwner === true;

  const handleCardClick = () => {
    navigate(`/rides/${id}`);
  };

  const handleJoinRequest = async () => {
    if (!showRequestModal) {
      setShowRequestModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await requestService.sendRequest(id, requestMessage, seatsRequested);
      if (response.success) {
        alert('Request sent successfully!');
        setShowRequestModal(false);
        setRequestMessage('');
        setSeatsRequested(1);
        onRefresh?.();
      } else {
        alert(response.error || 'Failed to send request');
      }
    } catch (error) {
      alert('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!confirm('Are you sure you want to cancel this ride? All participants will be notified.')) return;
    
    setLoading(true);
    try {
      const response = await rideService.cancelRide(id);
      if (response.success) {
        alert('Ride cancelled successfully!');
        onRefresh?.();
      } else {
        alert(response.error || 'Failed to cancel ride');
      }
    } catch (error) {
      alert('Failed to cancel ride');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRide = async () => {
    console.log('=== DELETE RIDE START ===');
    console.log('Ride ID:', id);
    
    setDeleteLoading(true);
    
    try {
      console.log('Calling rideService.deleteRide...');
      const response = await rideService.deleteRide(id);
      console.log('Delete response:', response);
      
      if (response.success) {
        console.log('Ride deleted successfully!');
        alert('Ride deleted successfully!');
        setShowDeleteConfirm(false);
        
        // Call onRefresh to reload the parent list
        if (onRefresh) {
          console.log('Calling onRefresh...');
          onRefresh();
        }
        
        // If on ride details page, navigate away
        if (window.location.pathname.includes(`/rides/${id}`)) {
          window.location.href = '/my-rides';
        }
      } else {
        console.error('Delete failed:', response.error);
        alert(response.error || 'Failed to delete ride. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Show more detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to delete ride. Please try again.';
      alert('Delete failed: ' + errorMessage);
    } finally {
      setDeleteLoading(false);
      console.log('=== DELETE RIDE END ===');
    }
  };

  const handleEditRide = async () => {
    setLoading(true);
    try {
      const response = await rideService.updateRide(id, editForm);
      if (response.success) {
        alert('Ride updated successfully!');
        setShowEditModal(false);
        onRefresh?.();
      } else {
        alert(response.error || 'Failed to update ride');
      }
    } catch (error) {
      alert('Failed to update ride');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequests = async () => {
    setLoadingRequests(true);
    try {
      console.log('Fetching requests for ride:', id);
      const response = await requestService.getRequestsByRide(id);
      console.log('Requests response:', response);
      
      if (response.success) {
        const requests = response.data || [];
        console.log('Found requests:', requests.length);
        setIncomingRequests(requests);
        setShowRequestsModal(true);
      } else {
        alert(response.error || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Failed to fetch requests. Please try again.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await requestService.approveRequest(requestId);
      if (response.success) {
        alert('Request approved! The participant has been added.');
        const refreshed = await requestService.getRequestsByRide(id);
        if (refreshed.success) {
          setIncomingRequests(refreshed.data || []);
        }
        onRefresh?.();
      } else {
        alert(response.error || 'Failed to approve');
      }
    } catch (error) {
      alert('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <>
      <Card className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar src={owner?.avatar} name={owner?.name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{owner?.name}</p>
                {owner?.verified && <FiCheck className="w-4 h-4 text-success" />}
              </div>
              <p className="text-xs text-gray-400">{formatDate.relative(dateTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && <Badge variant="primary">My Ride</Badge>}
            <Badge variant={statusConfig.color?.toLowerCase() || 'info'}>{statusConfig.label}</Badge>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-start gap-3 mb-2">
            <FiMapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">From</p>
              <p className="text-white font-medium">{source}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiNavigation className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">To</p>
              <p className="text-white font-medium">{destination}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-t border-dark-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <FiCalendar className="w-4 h-4" />
              <span>{formatDate.short(dateTime)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <FiClock className="w-4 h-4" />
              <span>{formatDate.time(dateTime)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <FiUsers className="w-4 h-4" />
              <span className={cn(isFull && 'text-error')}>{seatsLeft}/{totalSeats} seats</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-white">
              <FiDollarSign className="w-4 h-4 text-accent" />
              <span>{formatCurrency.standard(costPerPerson)}</span>
            </div>
          </div>
        </div>
        
        {showActions && status === 'UPCOMING' && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <Button size="sm" variant="ghost" leftIcon={<FiEye />} onClick={handleCardClick}>
              View
            </Button>
            
            {isOwner ? (
              <>
                <Button size="sm" variant="outline" leftIcon={<FiEdit2 />} onClick={() => setShowEditModal(true)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" leftIcon={<FiUserPlus />} onClick={handleViewRequests}>
                  Requests
                </Button>
                <Button size="sm" variant="ghost" leftIcon={<FiXCircle />} onClick={handleCancelRide}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  leftIcon={deleteLoading ? <FiLoader className="animate-spin" /> : <FiTrash2 />} 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteLoading}
                  className="text-error"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            ) : (
              <Button 
                size="sm"
                variant={isFull ? 'ghost' : 'primary'}
                onClick={handleJoinRequest}
                disabled={isFull}
                leftIcon={<FiSend />}
              >
                {isFull ? 'Ride Full' : 'Request to Join'}
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        title="Delete Ride" 
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-center">
            <FiAlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
            <p className="text-white font-medium mb-2">Permanently delete this ride?</p>
            <p className="text-sm text-gray-400">
              This action cannot be undone. All associated requests and messages will be deleted.
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              loading={deleteLoading}
              onClick={handleDeleteRide}
              className="bg-error hover:bg-error-dark"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete Ride'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Ride" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Input name="source" label="From *" value={editForm.source} onChange={(e) => setEditForm({...editForm, source: e.target.value})} />
            <Input name="destination" label="To *" value={editForm.destination} onChange={(e) => setEditForm({...editForm, destination: e.target.value})} />
          </div>
          
          <Input name="dateTime" type="datetime-local" label="Date & Time *" value={editForm.dateTime?.toString()?.slice(0, 16)} onChange={(e) => setEditForm({...editForm, dateTime: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input name="availableSeats" type="number" label="Available Seats" value={editForm.availableSeats} onChange={(e) => setEditForm({...editForm, availableSeats: parseInt(e.target.value)})} min={1} />
            <Input name="totalSeats" type="number" label="Total Seats" value={editForm.totalSeats} onChange={(e) => setEditForm({...editForm, totalSeats: parseInt(e.target.value)})} min={1} />
          </div>
          
          <Input name="costPerPerson" type="number" label="Cost per Person (₹)" value={editForm.costPerPerson} onChange={(e) => setEditForm({...editForm, costPerPerson: parseFloat(e.target.value)})} />
          <Input name="description" type="textarea" label="Description" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows={3} />
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth loading={loading} onClick={handleEditRide}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Request to Join Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request to Join Ride" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-dark-bg/50 rounded-lg">
            <p className="text-white font-medium">{source} → {destination}</p>
            <p className="text-sm text-gray-400">Owner: {owner?.name}</p>
            <p className="text-sm text-gray-400">Available: {seatsLeft} seats</p>
          </div>
          
          <Input name="seats" type="number" label="Number of Seats" value={seatsRequested} onChange={(e) => setSeatsRequested(parseInt(e.target.value) || 1)} min={1} max={seatsLeft} />
          <Input name="message" type="textarea" label="Message (Optional)" value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} rows={3} />
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowRequestModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth loading={loading} onClick={handleJoinRequest}>Send Request</Button>
          </div>
        </div>
      </Modal>

      {/* Incoming Requests Modal */}
      <Modal isOpen={showRequestsModal} onClose={() => setShowRequestsModal(false)} title={`Requests for ${source} → ${destination}`} size="md">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loadingRequests ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
                    <p className="text-xs text-gray-400">{req.user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge size="sm">{req.seatsRequested} seat(s)</Badge>
                      <Badge variant={req.status === 'PENDING' ? 'warning' : req.status === 'APPROVED' ? 'success' : 'error'} size="sm">
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {req.message && (
                  <div className="mb-3 p-3 bg-dark-bg rounded-lg">
                    <p className="text-sm text-gray-300">"{req.message}"</p>
                  </div>
                )}
                
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
    </>
  );
};

export default RideCard;