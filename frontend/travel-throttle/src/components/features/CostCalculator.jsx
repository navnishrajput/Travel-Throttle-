import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiInfo } from 'react-icons/fi';
import { FaGasPump, FaTools, FaRoad } from 'react-icons/fa';
import { Card, Button, Badge } from '../components/common';
import { rideService } from '../services/rideService';

export const CostCalculator = ({ rideId, onPriceSelect }) => {
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (rideId) {
      fetchCostBreakdown();
    }
  }, [rideId]);
  
  const fetchCostBreakdown = async () => {
    setLoading(true);
    try {
      const response = await rideService.getCostBreakdown(rideId);
      if (response.success) {
        setBreakdown(response.data);
      }
    } catch (error) {
      console.error('Error fetching cost breakdown:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 bg-dark-bg/50 rounded w-32 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-dark-bg/50 rounded"></div>
          <div className="h-4 bg-dark-bg/50 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }
  
  if (!breakdown) return null;
  
  return (
    <Card className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <FiDollarSign className="text-accent" />
          Cost Breakdown
        </h3>
        <Badge variant="accent">
          {breakdown.distance?.toFixed(1)} km
        </Badge>
      </div>
      
      {/* Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Cost per person</span>
          <span className="text-2xl font-bold text-accent">
            ₹{breakdown.costPerPerson}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-gray-400">Suggested price (with 10% margin)</span>
          <span className="text-white font-semibold">
            ₹{breakdown.suggestedPrice}
          </span>
        </div>
      </div>
      
      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-sm text-primary hover:text-primary-light flex items-center justify-center gap-1 mb-3"
      >
        <FiInfo className="w-4 h-4" />
        {showDetails ? 'Hide' : 'Show'} detailed breakdown
      </button>
      
      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-3 animate-fade-in">
          <CostItem icon={FaGasPump} label="Fuel Cost" value={breakdown.fuelCost} />
          <CostItem icon={FaRoad} label="Toll Charges" value={breakdown.tollCost} />
          <CostItem icon={FaTools} label="Maintenance" value={breakdown.maintenanceCost} />
          <CostItem icon={FiTrendingUp} label="Driver Allowance" value={breakdown.driverAllowance} />
          
          <div className="pt-3 border-t border-white/10">
            <CostItem 
              icon={FiDollarSign} 
              label="Total Cost" 
              value={breakdown.totalCost} 
              highlight 
            />
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>Fuel Price: ₹{breakdown.fuelPrice}/L</p>
            <p>Bike Mileage: {breakdown.bikeMileage} km/L</p>
          </div>
        </div>
      )}
      
      {/* Use Suggested Price Button */}
      {onPriceSelect && (
        <Button
          variant="primary"
          fullWidth
          size="sm"
          className="mt-4"
          onClick={() => onPriceSelect(breakdown.suggestedPrice)}
        >
          Use Suggested Price
        </Button>
      )}
    </Card>
  );
};

const CostItem = ({ icon: Icon, label, value, highlight }) => (
  <div className={`flex items-center justify-between ${highlight ? 'font-semibold' : ''}`}>
    <span className="text-gray-400 flex items-center gap-2">
      <Icon className="w-4 h-4" />
      {label}
    </span>
    <span className={highlight ? 'text-accent' : 'text-white'}>
      ₹{value?.toFixed(2)}
    </span>
  </div>
);