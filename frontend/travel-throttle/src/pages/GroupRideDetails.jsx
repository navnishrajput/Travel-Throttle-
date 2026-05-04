import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupRideService } from '../services/groupRideService';
import { bikeService } from '../services/bikeService';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Card, Button, Badge, Avatar, Modal, Input } from '../components/common';
import { FiMapPin, FiCalendar, FiClock, FiDollarSign, FiArrowLeft, FiCheck, FiX, FiLoader, FiUserPlus, FiMessageCircle, FiNavigation, FiInfo, FiShare2 } from 'react-icons/fi';
import { FaMotorcycle, FaUsers as FaUsersIcon, FaCrown } from 'react-icons/fa';

const GroupRideDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [groupRide, setGroupRide] = useState(null);
    const [userBikes, setUserBikes] = useState([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedBikeId, setSelectedBikeId] = useState('');
    const [joinMessage, setJoinMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    const isLeadRider = user?.id === groupRide?.leadRider?.id;
    const isMember = groupRide?.members?.some(m => m.userId === user?.id && m.status === 'APPROVED');
    const isPending = groupRide?.members?.some(m => m.userId === user?.id && m.status === 'PENDING');
    const canJoin = !isLeadRider && !isMember && !isPending && groupRide?.status === 'UPCOMING';
    
    useEffect(() => { fetchGroupRide(); fetchUserBikes(); }, [id]);
    
    const fetchGroupRide = async () => {
        setLoading(true);
        const response = await groupRideService.getGroupRide(id);
        if (response.success) setGroupRide(response.data);
        else navigate('/group-rides');
        setLoading(false);
    };
    
    const fetchUserBikes = async () => {
        const response = await bikeService.getMyBikes();
        if (response.success) { setUserBikes(response.data || []); if (response.data.length > 0) setSelectedBikeId(response.data[0].id); }
    };
    
    const handleJoinRequest = async () => {
        if (!selectedBikeId) { alert('Please select a bike'); return; }
        setActionLoading(true);
        const response = await groupRideService.joinGroupRide(id, selectedBikeId, joinMessage);
        if (response.success) { alert('Join request sent!'); setShowJoinModal(false); fetchGroupRide(); }
        else alert(response.error || 'Failed to send request');
        setActionLoading(false);
    };
    
    const handleApproveMember = async (memberId) => {
        setActionLoading(true);
        const response = await groupRideService.approveMember(memberId);
        if (response.success) fetchGroupRide();
        else alert(response.error || 'Failed to approve');
        setActionLoading(false);
    };
    
    const handleRejectMember = async (memberId) => {
        setActionLoading(true);
        const response = await groupRideService.rejectMember(memberId);
        if (response.success) fetchGroupRide();
        setActionLoading(false);
    };
    
    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><FiLoader className="w-8 h-8 text-primary animate-spin" /></div>;
    if (!groupRide) return null;
    
    const approvedMembers = groupRide.members?.filter(m => m.status === 'APPROVED') || [];
    const pendingMembers = groupRide.members?.filter(m => m.status === 'PENDING') || [];
    
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white"><FiArrowLeft /> Back</button>
                <Button variant="ghost" size="sm" leftIcon={<FiShare2 />}>Share</Button>
            </div>
            
            <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">{groupRide.groupName}</h1>
                        <div className="flex items-center gap-3">
                            <Badge variant={groupRide.status === 'UPCOMING' ? 'success' : 'info'}>{groupRide.status}</Badge>
                            <Badge variant="primary"><FaMotorcycle className="inline mr-1" />{groupRide.currentBikes}/{groupRide.maxBikes} Bikes</Badge>
                            {isLeadRider && <Badge variant="accent"><FaCrown className="inline mr-1" />Lead Rider</Badge>}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-start gap-4 mb-6">
                    <div className="flex flex-col items-center"><FiMapPin className="w-5 h-5 text-primary" /><div className="w-0.5 h-12 bg-dark-border my-1" /><FiNavigation className="w-5 h-5 text-accent" /></div>
                    <div className="flex-1 space-y-3"><div><p className="text-sm text-gray-400">From</p><p className="text-white font-medium">{groupRide.source}</p></div><div><p className="text-sm text-gray-400">To</p><p className="text-white font-medium">{groupRide.destination}</p></div></div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <StatBadge icon={FiCalendar} label="Date" value={formatDate.short(groupRide.dateTime)} />
                    <StatBadge icon={FiClock} label="Time" value={formatDate.time(groupRide.dateTime)} />
                    {groupRide.costPerPerson > 0 && <StatBadge icon={FiDollarSign} label="Cost" value={formatCurrency.standard(groupRide.costPerPerson)} />}
                </div>
                {groupRide.description && <div className="p-4 bg-dark-bg/30 rounded-lg"><p className="text-gray-300 text-sm">{groupRide.description}</p></div>}
            </Card>
            
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FaCrown className="text-yellow-500" />Lead Rider</h3>
                <div className="flex items-center gap-4"><Avatar src={groupRide.leadRider?.avatar} name={groupRide.leadRider?.name} size="lg" /><div><p className="text-white font-semibold">{groupRide.leadRider?.name}</p><p className="text-sm text-gray-400">{groupRide.leadBike?.model} • {groupRide.leadBike?.registrationNumber}</p></div></div>
            </Card>
            
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FaUsersIcon className="text-primary" />Members ({approvedMembers.length + 1})</h3>
                {approvedMembers.length > 0 ? (
                    <div className="space-y-3">
                        {approvedMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-dark-bg/30 rounded-lg">
                                <div className="flex items-center gap-3"><Avatar src={member.userAvatar} name={member.userName} size="md" /><div><p className="text-white">{member.userName}</p><p className="text-sm text-gray-400">{member.bikeModel}</p></div></div>
                                {member.userId === user?.id && <Badge variant="success">You</Badge>}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-400 text-center py-4">No other members yet</p>}
            </Card>
            
            {isLeadRider && pendingMembers.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Requests ({pendingMembers.length})</h3>
                    <div className="space-y-3">
                        {pendingMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-dark-bg/30 rounded-lg">
                                <div className="flex items-center gap-3"><Avatar src={member.userAvatar} name={member.userName} size="md" /><div><p className="text-white">{member.userName}</p><p className="text-sm text-gray-400">{member.bikeModel}</p>{member.joinMessage && <p className="text-xs text-gray-500 mt-1">"{member.joinMessage}"</p>}</div></div>
                                <div className="flex gap-2"><Button size="sm" variant="primary" leftIcon={<FiCheck />} onClick={() => handleApproveMember(member.id)} loading={actionLoading}>Approve</Button><Button size="sm" variant="ghost" leftIcon={<FiX />} onClick={() => handleRejectMember(member.id)}>Reject</Button></div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            
            <Card className="p-6">
                <div className="space-y-3">
                    {canJoin && <Button variant="primary" fullWidth size="lg" leftIcon={<FiUserPlus />} onClick={() => setShowJoinModal(true)}>Request to Join Group Ride</Button>}
                    {isPending && <div className="text-center p-3 bg-warning/10 rounded-lg"><p className="text-warning">Your request is pending approval</p></div>}
                    {isMember && <Button variant="outline" fullWidth leftIcon={<FiMessageCircle />} onClick={() => navigate(`/messages?groupId=${id}`)}>Group Chat</Button>}
                </div>
            </Card>
            
            <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Group Ride" size="md">
                <div className="space-y-4">
                    <div className="p-3 bg-dark-bg/50 rounded-lg"><p className="text-white font-medium">{groupRide.groupName}</p><p className="text-sm text-gray-400">{groupRide.source} → {groupRide.destination}</p></div>
                    <Input name="bikeId" type="select" label="Select Your Bike" value={selectedBikeId} onChange={(e) => setSelectedBikeId(e.target.value)} options={[{ value: '', label: 'Select a bike', disabled: true }, ...userBikes.map(b => ({ value: b.id, label: `${b.model} - ${b.registrationNumber}` }))]} required />
                    <Input name="message" type="textarea" label="Message (Optional)" placeholder="Introduce yourself..." value={joinMessage} onChange={(e) => setJoinMessage(e.target.value)} rows={3} />
                    <div className="flex gap-3 pt-4"><Button variant="ghost" onClick={() => setShowJoinModal(false)}>Cancel</Button><Button variant="primary" fullWidth loading={actionLoading} onClick={handleJoinRequest}>Send Request</Button></div>
                </div>
            </Modal>
        </div>
    );
};

const StatBadge = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-dark-bg/50 rounded-lg"><Icon className="w-4 h-4 text-primary" /><div><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-medium text-white">{value}</p></div></div>
);

export default GroupRideDetails;