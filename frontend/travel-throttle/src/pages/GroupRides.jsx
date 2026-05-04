/**
 * GROUP RIDES PAGE
 * List all group rides
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupRideService } from '../services/groupRideService';
import GroupRideCard from '../components/features/GroupRideCard';
import { Button, Card, Input } from '../components/common';
import { FiPlus, FiSearch, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { FaMotorcycle, FaUsers } from 'react-icons/fa';

const GroupRides = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [groupRides, setGroupRides] = useState([]);
    const [filteredRides, setFilteredRides] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    
    useEffect(() => {
        fetchGroupRides();
    }, [activeTab]);
    
    useEffect(() => {
        filterRides();
    }, [searchTerm, groupRides]);
    
    const fetchGroupRides = async (showRefresh = false) => {
        if (showRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        
        try {
            let response;
            if (activeTab === 'my') {
                response = await groupRideService.getMyGroupRides();
            } else {
                response = await groupRideService.getUpcomingGroupRides();
            }
            
            if (response.success) {
                setGroupRides(response.data || []);
            } else {
                setGroupRides([]);
            }
        } catch (error) {
            console.error('Error fetching group rides:', error);
            setGroupRides([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    
    const filterRides = () => {
        if (!searchTerm.trim()) {
            setFilteredRides(groupRides);
            return;
        }
        
        const term = searchTerm.toLowerCase();
        const filtered = groupRides.filter(ride =>
            ride.groupName?.toLowerCase().includes(term) ||
            ride.source?.toLowerCase().includes(term) ||
            ride.destination?.toLowerCase().includes(term) ||
            ride.leadRider?.name?.toLowerCase().includes(term)
        );
        
        setFilteredRides(filtered);
    };
    
    const handleRefresh = () => {
        fetchGroupRides(true);
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiLoader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FaUsers className="text-primary" />
                        Group Rides
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Join multi-bike group rides and ride together with fellow bikers
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        leftIcon={<FiRefreshCw className={refreshing ? 'animate-spin' : ''} />}
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        Refresh
                    </Button>
                    <Button 
                        variant="primary" 
                        leftIcon={<FiPlus />} 
                        onClick={() => navigate('/create-group-ride')}
                    >
                        Create Group Ride
                    </Button>
                </div>
            </div>
            
            <Card>
                <div className="flex gap-2 border-b border-dark-border pb-3 mb-4">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            activeTab === 'all' 
                                ? 'bg-primary text-white' 
                                : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                        }`}
                    >
                        <FaUsers className="w-4 h-4" />
                        All Group Rides
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            activeTab === 'my' 
                                ? 'bg-primary text-white' 
                                : 'text-gray-400 hover:text-white hover:bg-dark-bg'
                        }`}
                    >
                        <FaMotorcycle className="w-4 h-4" />
                        My Group Rides
                    </button>
                </div>
                
                <div className="relative mb-4">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by group name, location, or lead rider..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-bg/50 border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                
                <p className="text-gray-400 text-sm mb-4">
                    {filteredRides.length} group ride{filteredRides.length !== 1 ? 's' : ''} found
                </p>
                
                {filteredRides.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRides.map(ride => (
                            <GroupRideCard key={ride.id} ride={ride} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FaMotorcycle className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Group Rides Found</h3>
                        <p className="text-gray-400 mb-4">
                            {activeTab === 'my' 
                                ? "You haven't joined or created any group rides yet." 
                                : "Be the first to create a group ride!"}
                        </p>
                        <Button variant="primary" onClick={() => navigate('/create-group-ride')}>
                            <FiPlus className="w-4 h-4 mr-2" />
                            Create Group Ride
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default GroupRides;