import { useNavigate } from 'react-router-dom';
import { Card, Badge, Avatar } from '../common';
import { FiMapPin, FiCalendar, FiNavigation } from 'react-icons/fi';
import { FaMotorcycle, FaCrown } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

const GroupRideCard = ({ ride }) => {
    const navigate = useNavigate();
    
    if (!ride) return null;
    
    return (
        <Card 
            className="glass-card hover:scale-[1.02] transition-all cursor-pointer group"
            onClick={() => navigate(`/group-rides/${ride.id}`)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg group-hover:text-primary transition-colors">
                        {ride.groupName || 'Group Ride'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="primary" size="sm">
                            <FaMotorcycle className="inline mr-1" />
                            {ride.currentBikes || 1}/{ride.maxBikes || 10} Bikes
                        </Badge>
                        <Badge variant={ride.status === 'UPCOMING' ? 'success' : 'info'} size="sm">
                            {ride.status || 'UPCOMING'}
                        </Badge>
                    </div>
                </div>
            </div>
            
            <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center">
                    <FiMapPin className="w-4 h-4 text-primary" />
                    <div className="w-0.5 h-8 bg-dark-border my-1" />
                    <FiNavigation className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{ride.source || 'N/A'}</p>
                    <p className="text-gray-400 text-sm truncate">{ride.destination || 'N/A'}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar src={ride.leadRider?.avatar} name={ride.leadRider?.name || 'Rider'} size="xs" />
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                        {ride.leadRider?.name || 'Lead Rider'}
                        {ride.isLeadRider && <FaCrown className="w-3 h-3 text-yellow-500" />}
                    </span>
                </div>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {ride.dateTime ? formatDate.short(ride.dateTime) : 'TBD'}
                </span>
            </div>
            
            {ride.isMember && (
                <div className="mt-3 pt-3 border-t border-dark-border">
                    <Badge variant="success" size="sm" className="w-full justify-center">
                        ✓ You're a member
                    </Badge>
                </div>
            )}
            
            {ride.isPending && (
                <div className="mt-3 pt-3 border-t border-dark-border">
                    <Badge variant="warning" size="sm" className="w-full justify-center">
                        ⏳ Pending Approval
                    </Badge>
                </div>
            )}
        </Card>
    );
};

export default GroupRideCard;