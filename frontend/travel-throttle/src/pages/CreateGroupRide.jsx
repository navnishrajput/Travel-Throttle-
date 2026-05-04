/**
 * CREATE GROUP RIDE PAGE
 * Form to create a multi-bike group ride
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupRideService } from '../services/groupRideService';
import { bikeService } from '../services/bikeService';
import { Card, Button, Input } from '../components/common';
import { 
    FiMapPin, FiCalendar, FiUsers, FiDollarSign, 
    FiInfo, FiArrowLeft, FiCheck, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import { FaMotorcycle, FaUsers as FaUsersIcon } from 'react-icons/fa';

const CreateGroupRide = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingBikes, setLoadingBikes] = useState(true);
    const [bikes, setBikes] = useState([]);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        groupName: '',
        source: '',
        destination: '',
        dateTime: '',
        description: '',
        leadBikeId: '',
        maxBikes: 10,
        costPerPerson: '',
        allowFemaleOnly: false,
        isPublic: true
    });

    useEffect(() => {
        fetchBikes();
    }, []);

    const fetchBikes = async () => {
        setLoadingBikes(true);
        try {
            const response = await bikeService.getMyBikes();
            if (response.success) {
                const bikeData = response.data || [];
                setBikes(bikeData);
                if (bikeData.length > 0) {
                    setFormData(prev => ({ ...prev, leadBikeId: bikeData[0].id }));
                }
            }
        } catch (error) {
            console.error('Error fetching bikes:', error);
        } finally {
            setLoadingBikes(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.groupName.trim()) newErrors.groupName = 'Group name is required';
        if (!formData.source.trim()) newErrors.source = 'Starting point is required';
        if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
        if (!formData.dateTime) newErrors.dateTime = 'Date and time is required';
        if (!formData.leadBikeId) newErrors.leadBikeId = 'Please select a bike';
        if (formData.maxBikes < 2) newErrors.maxBikes = 'Minimum 2 bikes required';
        if (formData.maxBikes > 20) newErrors.maxBikes = 'Maximum 20 bikes allowed';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const response = await groupRideService.createGroupRide(formData);
            if (response.success) {
                alert('Group ride created successfully!');
                navigate('/group-rides');
            } else {
                alert(response.error || 'Failed to create group ride');
            }
        } catch (error) {
            alert('Failed to create group ride');
        } finally {
            setLoading(false);
        }
    };

    if (loadingBikes) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiLoader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (bikes.length === 0) {
        return (
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <FaUsersIcon className="text-primary" />
                    Create Group Ride
                </h1>
                <Card className="text-center py-12">
                    <FaMotorcycle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Bikes in Garage</h3>
                    <p className="text-gray-400 mb-4">Add a bike to your garage first.</p>
                    <Button variant="primary" onClick={() => navigate('/garage')}>
                        Go to Garage
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
                    <FiArrowLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FaUsersIcon className="text-primary" /> Create Group Ride
                </h1>
                <p className="text-gray-400 mt-1">Lead a multi-bike group ride</p>
            </div>

            <Card className="p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input name="groupName" label="Group Name" placeholder="e.g., Sunday Morning Ride" value={formData.groupName} onChange={handleChange} error={errors.groupName} leftIcon={<FaUsersIcon className="w-4 h-4" />} required />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="source" label="From" placeholder="Starting point" value={formData.source} onChange={handleChange} error={errors.source} leftIcon={<FiMapPin />} required />
                        <Input name="destination" label="To" placeholder="Destination" value={formData.destination} onChange={handleChange} error={errors.destination} leftIcon={<FiMapPin />} required />
                    </div>

                    <Input name="dateTime" type="datetime-local" label="Date & Time" value={formData.dateTime} onChange={handleChange} error={errors.dateTime} leftIcon={<FiCalendar />} required />
                    <Input name="description" type="textarea" label="Description" placeholder="Meeting point, route details..." value={formData.description} onChange={handleChange} rows={3} />
                    
                    <Input name="leadBikeId" type="select" label="Select Your Bike" value={formData.leadBikeId} onChange={handleChange} error={errors.leadBikeId} options={[{ value: '', label: 'Select a bike', disabled: true }, ...bikes.map(b => ({ value: b.id, label: `${b.model} - ${b.registrationNumber}` }))]} required />

                    <div className="grid grid-cols-2 gap-4">
                        <Input name="maxBikes" type="number" label="Max Bikes" value={formData.maxBikes} onChange={handleChange} error={errors.maxBikes} leftIcon={<FiUsers />} min={2} max={20} />
                        <Input name="costPerPerson" type="number" label="Cost per Person (₹)" value={formData.costPerPerson} onChange={handleChange} leftIcon={<FiDollarSign />} min={0} />
                    </div>

                    <label className="flex items-center gap-3">
                        <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-4 h-4 rounded border-dark-border" />
                        <span className="text-gray-300">Make this group ride public</span>
                    </label>

                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <p className="text-sm text-gray-300 flex items-start gap-2">
                            <FiInfo className="w-4 h-4 text-primary mt-0.5" />
                            <span>As lead rider, you'll approve join requests and coordinate the group.</span>
                        </p>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div className="p-3 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2">
                            <FiAlertCircle className="w-4 h-4 text-error mt-0.5" />
                            <span className="text-sm text-error">Please fix the errors above.</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-dark-border">
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit" variant="primary" loading={loading} fullWidth rightIcon={<FiCheck />}>
                            {loading ? 'Creating...' : 'Create Group Ride'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateGroupRide;