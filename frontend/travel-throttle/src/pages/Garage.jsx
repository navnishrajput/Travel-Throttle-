/**
 * GARAGE PAGE
 * Enhanced garage with better styling
 */

import { useState, useEffect, useCallback } from 'react';
import { bikeService } from '../services/bikeService';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, Modal, Input } from '../components/common';
import { FiPlus, FiEdit2, FiTrash2, FiTool, FiAlertCircle, FiCheckCircle, FiSearch } from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

export const Garage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [formData, setFormData] = useState({
    model: '', registrationNumber: '', color: '', year: '', mileage: '', capacity: 2
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchBikes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bikeService.getMyBikes();
      if (response.success) {
        const bikeData = response.data || [];
        setBikes(bikeData);
        setFilteredBikes(bikeData);
      } else {
        setError(response.error || 'Failed to fetch bikes');
      }
    } catch (error) {
      setError('Failed to fetch bikes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = bikes.filter(bike => 
        bike.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBikes(filtered);
    } else {
      setFilteredBikes(bikes);
    }
  }, [searchTerm, bikes]);

  const handleAddBike = async () => {
    if (!formData.model || !formData.registrationNumber || !formData.color) {
      setError('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const bikeData = {
        model: formData.model.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        color: formData.color.trim(),
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : 2,
      };
      
      const response = await bikeService.addBike(bikeData);
      if (response.success) {
        setSuccessMessage('Bike added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchBikes();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.error || 'Failed to add bike');
      }
    } catch (error) {
      setError('Failed to add bike');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBike = async () => {
    if (!formData.model || !formData.color) {
      setError('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const bikeData = {
        model: formData.model.trim(),
        color: formData.color.trim(),
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : 2,
      };
      
      const response = await bikeService.updateBike(editingBike.id, bikeData);
      if (response.success) {
        setSuccessMessage('Bike updated successfully!');
        setEditingBike(null);
        resetForm();
        fetchBikes();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.error || 'Failed to update bike');
      }
    } catch (error) {
      setError('Failed to update bike');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBike = async (bikeId) => {
    if (!confirm('Are you sure you want to delete this bike?')) return;
    
    try {
      const response = await bikeService.deleteBike(bikeId);
      if (response.success) {
        setSuccessMessage('Bike deleted successfully!');
        fetchBikes();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.error || 'Failed to delete bike');
      }
    } catch (error) {
      setError('Failed to delete bike');
    }
  };

  const openEditModal = (bike) => {
    setEditingBike(bike);
    setFormData({
      model: bike.model || '',
      registrationNumber: bike.registrationNumber || '',
      color: bike.color || '',
      year: bike.year?.toString() || '',
      mileage: bike.mileage || '',
      capacity: bike.capacity || 2
    });
    setError('');
  };

  const resetForm = () => {
    setFormData({ model: '', registrationNumber: '', color: '', year: '', mileage: '', capacity: 2 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaMotorcycle className="text-primary" />
            My Garage
          </h1>
          <p className="text-gray-400 mt-1">
            {bikes.length} {bikes.length === 1 ? 'bike' : 'bikes'} in your garage
          </p>
        </div>
        <Button variant="primary" size="lg" leftIcon={<FiPlus />} onClick={() => { resetForm(); setShowAddModal(true); }}>
          Add New Bike
        </Button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <FiCheckCircle className="w-5 h-5 text-success" />
          <p className="text-success">{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-xl flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-error" />
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      {bikes.length > 0 && (
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bikes by model or registration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Bikes Grid */}
      {filteredBikes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBikes.map(bike => (
            <Card key={bike.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaMotorcycle className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white truncate">{bike.model}</h3>
                      <p className="text-sm text-gray-400">{bike.color}</p>
                    </div>
                    <Badge variant={bike.verified ? 'success' : 'warning'} size="sm">
                      {bike.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Registration</span>
                      <span className="text-white font-mono">{bike.registrationNumber}</span>
                    </div>
                    {bike.year && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Year</span>
                        <span className="text-white">{bike.year}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capacity</span>
                      <span className="text-white">{bike.capacity || 2} seats</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-3 border-t border-dark-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      leftIcon={<FiEdit2 />}
                      onClick={() => openEditModal(bike)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      leftIcon={<FiTrash2 />}
                      onClick={() => handleDeleteBike(bike.id)}
                      className="text-error hover:bg-error/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <FaMotorcycle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No bikes yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Add your first bike to start creating rides and sharing your journey with others!
          </p>
          <Button variant="primary" size="lg" leftIcon={<FiPlus />} onClick={() => setShowAddModal(true)}>
            Add Your First Bike
          </Button>
        </Card>
      )}

      {/* Add/Edit Bike Modal */}
      <Modal
        isOpen={showAddModal || editingBike !== null}
        onClose={() => { setShowAddModal(false); setEditingBike(null); resetForm(); }}
        title={editingBike ? 'Edit Bike' : 'Add New Bike'}
        size="md"
      >
        <div className="space-y-4">
          <Input 
            name="model" 
            label="Model *" 
            placeholder="e.g., Royal Enfield Classic 350" 
            value={formData.model} 
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            leftIcon={<FaMotorcycle />}
          />
          <Input 
            name="registrationNumber" 
            label="Registration Number *" 
            placeholder="e.g., MH01AB1234" 
            value={formData.registrationNumber} 
            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
            disabled={editingBike !== null}
            leftIcon={<FiTool />}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="color" 
              label="Color *" 
              placeholder="e.g., Black" 
              value={formData.color} 
              onChange={(e) => setFormData({...formData, color: e.target.value})}
            />
            <Input 
              name="year" 
              type="number" 
              label="Year" 
              placeholder="e.g., 2024" 
              value={formData.year} 
              onChange={(e) => setFormData({...formData, year: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="mileage" 
              label="Mileage" 
              placeholder="e.g., 35 km/l" 
              value={formData.mileage} 
              onChange={(e) => setFormData({...formData, mileage: e.target.value})}
            />
            <Input 
              name="capacity" 
              type="number" 
              label="Capacity (seats)" 
              placeholder="2" 
              value={formData.capacity} 
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setShowAddModal(false); setEditingBike(null); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              loading={submitting} 
              onClick={editingBike ? handleUpdateBike : handleAddBike}
            >
              {editingBike ? 'Update Bike' : 'Add Bike'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Garage;