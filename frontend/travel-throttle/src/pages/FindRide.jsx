/**
 * FIND RIDE PAGE
 * Search and browse available rides
 */

import { useState, useEffect } from 'react';
import { rideService } from '../services/rideService';
import { Card, Button, Input, Badge } from '../components/common';
import { RideCard } from '../components/features';
import { FiSearch, FiFilter, FiX, FiRefreshCw, FiLoader } from 'react-icons/fi';

export const FindRide = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    source: '', 
    destination: '', 
    maxPrice: '', 
    minSeats: '' 
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRides();
  }, []);

  useEffect(() => {
    // Filter rides based on search term
    if (Array.isArray(rides)) {
      const filtered = rides.filter(ride => {
        if (!ride) return false;
        const sourceMatch = ride.source?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const destMatch = ride.destination?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        return sourceMatch || destMatch;
      });
      setFilteredRides(filtered);
    } else {
      setFilteredRides([]);
    }
  }, [searchTerm, rides]);

  const fetchRides = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      console.log('=== FETCHING ALL RIDES ===');
      const response = await rideService.getAllRides();
      console.log('Rides response:', response);
      
      if (response.success) {
        let ridesData = [];
        if (response.data?.content) {
          ridesData = response.data.content;
        } else if (Array.isArray(response.data)) {
          ridesData = response.data;
        }
        
        console.log('Raw rides data:', ridesData.length, 'items');
        
        // Filter out null values and only UPCOMING rides with available seats
        const validRides = ridesData.filter(ride => {
          if (!ride || !ride.id) {
            console.log('Invalid ride (no ID):', ride);
            return false;
          }
          
          const isUpcoming = ride.status === 'UPCOMING';
          const hasSeats = ride.availableSeats > 0;
          const isFuture = ride.dateTime && new Date(ride.dateTime) > new Date();
          
          console.log(`Ride ${ride.id}: status=${ride.status}, seats=${ride.availableSeats}, isUpcoming=${isUpcoming}, hasSeats=${hasSeats}, isFuture=${isFuture}`);
          
          return isUpcoming && hasSeats && isFuture;
        });
        
        console.log('Valid rides:', validRides.length);
        setRides(validRides);
        setFilteredRides(validRides);
      } else {
        console.error('Failed to fetch rides:', response.error);
        setError(response.error || 'Failed to fetch rides');
        setRides([]);
        setFilteredRides([]);
      }
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      setError('Failed to fetch rides. Please try again.');
      setRides([]);
      setFilteredRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('=== SEARCHING RIDES ===');
      console.log('Filters:', filters);
      
      const searchFilters = {};
      if (filters.source) searchFilters.source = filters.source;
      if (filters.destination) searchFilters.destination = filters.destination;
      if (filters.maxPrice) searchFilters.maxPrice = filters.maxPrice;
      if (filters.minSeats) searchFilters.minSeats = filters.minSeats;
      
      const response = await rideService.searchRides(searchFilters);
      console.log('Search response:', response);
      
      if (response.success) {
        let ridesData = [];
        if (response.data?.content) {
          ridesData = response.data.content;
        } else if (Array.isArray(response.data)) {
          ridesData = response.data;
        }
        
        const validRides = ridesData.filter(ride => 
          ride && ride.id && ride.status === 'UPCOMING' && ride.availableSeats > 0
        );
        
        console.log('Search found', validRides.length, 'valid rides');
        setRides(validRides);
        setFilteredRides(validRides);
      } else {
        setError(response.error || 'Search failed');
        setRides([]);
        setFilteredRides([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ source: '', destination: '', maxPrice: '', minSeats: '' });
    setSearchTerm('');
    setError('');
    fetchRides();
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Find a Ride</h1>
          <p className="text-gray-400">Discover rides and join fellow travelers</p>
        </div>
        <Button 
          variant="ghost" 
          leftIcon={<FiRefreshCw className={refreshing ? 'animate-spin' : ''} />} 
          onClick={() => fetchRides(true)}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-error/10 border border-error/30 rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<FiSearch className="w-5 h-5" />}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<FiFilter />}
          >
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="primary" size="sm" className="ml-2">{activeFiltersCount}</Badge>
            )}
          </Button>
          <Button variant="primary" onClick={handleSearch}>Search</Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <FiX className="w-4 h-4" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="source"
                label="From"
                placeholder="Source"
                value={filters.source}
                onChange={(e) => setFilters({...filters, source: e.target.value})}
              />
              <Input
                name="destination"
                label="To"
                placeholder="Destination"
                value={filters.destination}
                onChange={(e) => setFilters({...filters, destination: e.target.value})}
              />
              <Input
                name="maxPrice"
                type="number"
                label="Max Price (₹)"
                placeholder="Any"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
              <Input
                name="minSeats"
                type="number"
                label="Min Seats"
                placeholder="Any"
                value={filters.minSeats}
                onChange={(e) => setFilters({...filters, minSeats: e.target.value})}
              />
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <p className="text-gray-400">{filteredRides.length} rides found</p>
        {filteredRides.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredRides.map(ride => (
              <RideCard 
                key={ride.id} 
                ride={ride} 
                onRefresh={() => fetchRides(true)}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <FiSearch className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No rides found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or create a new ride!</p>
            <Button variant="primary" onClick={clearFilters}>Clear Filters</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FindRide;