/**
 * CREATE RIDE PAGE
 * Form to create a new ride
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { bikeService } from '../services/bikeService';
import { ROUTES } from '../constants';
import { Card, Button, Input } from '../components/common';
import { FiMapPin, FiCalendar, FiUsers, FiDollarSign, FiLoader } from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

export const CreateRide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bikes, setBikes] = useState([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    dateTime: '',
    availableSeats: 1,
    totalSeats: 2,
    costPerPerson: '',
    bikeId: '',
    description: '',
    distance: '',
    duration: '',
    allowFemaleOnly: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    setLoadingBikes(true);
    try {
      console.log('Fetching bikes for create ride...');
      const response = await bikeService.getMyBikes();
      console.log('Bikes response:', response);
      
      if (response.success) {
        const bikeData = response.data || [];
        console.log('Found', bikeData.length, 'bikes');
        setBikes(bikeData);
        
        // Auto-select first bike if available
        if (bikeData.length > 0) {
          setFormData(prev => ({ ...prev, bikeId: bikeData[0].id }));
        }
      } else {
        console.error('Failed to fetch bikes:', response.error);
        setError('Failed to load your bikes. Please add a bike first.');
      }
    } catch (error) {
      console.error('Failed to fetch bikes:', error);
      setError('Failed to load bikes. Please try again.');
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.source.trim()) newErrors.source = 'Starting point is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.dateTime) newErrors.dateTime = 'Date and time is required';
    
    // Check if date is in the future
    if (formData.dateTime) {
      const selectedDate = new Date(formData.dateTime);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.dateTime = 'Ride date must be in the future';
      }
    }
    
    if (!formData.availableSeats || formData.availableSeats < 1) {
      newErrors.availableSeats = 'At least 1 seat required';
    }
    if (formData.availableSeats > formData.totalSeats) {
      newErrors.availableSeats = 'Available seats cannot exceed total seats';
    }
    if (!formData.costPerPerson || formData.costPerPerson < 0) {
      newErrors.costPerPerson = 'Valid cost is required';
    }
    if (!formData.bikeId) newErrors.bikeId = 'Please select a bike';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== CREATE RIDE SUBMIT ===');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare data for API
      const rideData = {
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        dateTime: formData.dateTime,
        availableSeats: parseInt(formData.availableSeats),
        totalSeats: parseInt(formData.totalSeats),
        costPerPerson: parseFloat(formData.costPerPerson),
        bikeId: formData.bikeId,
        description: formData.description.trim() || null,
        distance: formData.distance ? parseFloat(formData.distance) : null,
        duration: formData.duration || null,
        allowFemaleOnly: formData.allowFemaleOnly
      };
      
      console.log('Sending ride data to API:', rideData);
      
      const response = await rideService.createRide(rideData);
      console.log('Create ride response:', response);
      
      if (response.success) {
        alert('Ride created successfully!');
        console.log('Navigating to My Rides...');
        navigate(ROUTES.PROTECTED.MY_RIDES.path);
      } else {
        console.error('Failed to create ride:', response.error);
        setError(response.error || 'Failed to create ride');
      }
    } catch (error) {
      console.error('Create ride error:', error);
      setError('Failed to create ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingBikes) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading your bikes...</p>
        </div>
      </div>
    );
  }

  if (bikes.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create a New Ride</h1>
          <p className="text-gray-400">Share your journey and split the costs</p>
        </div>

        <Card className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <FaMotorcycle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Bikes in Your Garage</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You need to add a bike to your garage before you can create a ride.
          </p>
          <Button variant="primary" onClick={() => navigate('/garage')}>
            Add Your First Bike
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Create a New Ride</h1>
        <p className="text-gray-400">Share your journey and split the costs</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-error/10 border border-error/30 rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              name="source" 
              label="Starting Point" 
              placeholder="e.g., Andheri West, Mumbai" 
              value={formData.source} 
              onChange={handleChange} 
              error={errors.source} 
              leftIcon={<FiMapPin />} 
              required 
            />
            <Input 
              name="destination" 
              label="Destination" 
              placeholder="e.g., Lonavala" 
              value={formData.destination} 
              onChange={handleChange} 
              error={errors.destination} 
              leftIcon={<FiMapPin />} 
              required 
            />
          </div>

          <Input 
            name="dateTime" 
            type="datetime-local" 
            label="Date & Time" 
            value={formData.dateTime} 
            onChange={handleChange} 
            error={errors.dateTime} 
            leftIcon={<FiCalendar />} 
            required 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              name="availableSeats" 
              type="number" 
              label="Available Seats" 
              value={formData.availableSeats} 
              onChange={handleChange} 
              error={errors.availableSeats} 
              leftIcon={<FiUsers />} 
              min={1} 
              max={formData.totalSeats} 
              required 
            />
            <Input 
              name="totalSeats" 
              type="number" 
              label="Total Seats" 
              value={formData.totalSeats} 
              onChange={handleChange} 
              leftIcon={<FiUsers />} 
              min={1} 
              max={4} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              name="costPerPerson" 
              type="number" 
              label="Cost per Person (₹)" 
              placeholder="Enter amount" 
              value={formData.costPerPerson} 
              onChange={handleChange} 
              error={errors.costPerPerson} 
              leftIcon={<FiDollarSign />} 
              min={0} 
              required 
            />
            <Input 
              name="distance" 
              type="number" 
              label="Distance (km) - Optional" 
              placeholder="e.g., 85" 
              value={formData.distance} 
              onChange={handleChange} 
              leftIcon={<FiMapPin />} 
              min={0} 
            />
          </div>

          <Input 
            name="duration" 
            type="text" 
            label="Duration - Optional" 
            placeholder="e.g., 2.5 hours" 
            value={formData.duration} 
            onChange={handleChange} 
          />

          <Input 
            name="bikeId" 
            type="select" 
            label="Select Bike" 
            value={formData.bikeId} 
            onChange={handleChange} 
            error={errors.bikeId} 
            options={[
              { value: '', label: 'Select a bike', disabled: true },
              ...bikes.map(bike => ({ 
                value: bike.id, 
                label: `${bike.model} (${bike.color}) - ${bike.registrationNumber}` 
              }))
            ]} 
            required 
          />

          <Input 
            name="description" 
            type="textarea" 
            label="Additional Notes (Optional)" 
            placeholder="Any additional information for riders..." 
            value={formData.description} 
            onChange={handleChange} 
            rows={3} 
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="allowFemaleOnly"
              checked={formData.allowFemaleOnly}
              onChange={handleChange}
              className="w-4 h-4 rounded border-dark-border bg-dark-bg text-primary focus:ring-primary"
            />
            <span className="text-gray-300">Female riders only</span>
          </label>

          <div className="flex gap-3 pt-4 border-t border-dark-border">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} fullWidth>
              {loading ? 'Creating Ride...' : 'Create Ride'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateRide;