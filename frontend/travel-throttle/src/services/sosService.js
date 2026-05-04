/**
 * SOS SERVICE
 * Emergency SOS related API calls
 */

import api from './api';

const SOS_ENDPOINTS = {
  TRIGGER: '/sos/alert',
  ALERTS: '/sos/alerts',
  CONTACTS: '/sos/contacts',
  CONTACT_BY_ID: (id) => `/sos/contacts/${id}`,
};

export const sosService = {
  /**
   * Trigger SOS alert
   */
  triggerSOS: async (data) => {
    try {
      console.log('=== TRIGGER SOS ===', data);
      const response = await api.post(SOS_ENDPOINTS.TRIGGER, data);
      
      if (response?.success) {
        return { success: true, data: response.data, message: response.message };
      }
      return { success: false, error: response?.message || 'Failed to trigger SOS' };
    } catch (error) {
      console.error('Trigger SOS error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to trigger SOS' };
    }
  },

  /**
   * Get SOS alerts history
   */
  getSOSAlerts: async () => {
    try {
      const response = await api.get(SOS_ENDPOINTS.ALERTS);
      if (response?.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('Get SOS alerts error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get emergency contacts
   */
  getEmergencyContacts: async () => {
    try {
      const response = await api.get(SOS_ENDPOINTS.CONTACTS);
      if (response?.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('Get contacts error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Add emergency contact
   */
  addEmergencyContact: async (contactData) => {
    try {
      const response = await api.post(SOS_ENDPOINTS.CONTACTS, contactData);
      if (response?.success) {
        return { success: true, data: response.data, message: response.message };
      }
      return { success: false, error: response?.message || 'Failed to add contact' };
    } catch (error) {
      console.error('Add contact error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to add contact' };
    }
  },

  /**
   * Update emergency contact
   */
  updateEmergencyContact: async (contactId, contactData) => {
    try {
      const response = await api.put(SOS_ENDPOINTS.CONTACT_BY_ID(contactId), contactData);
      if (response?.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response?.message };
    } catch (error) {
      console.error('Update contact error:', error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  /**
   * Delete emergency contact
   */
  deleteEmergencyContact: async (contactId) => {
    try {
      const response = await api.delete(SOS_ENDPOINTS.CONTACT_BY_ID(contactId));
      if (response?.success) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Delete contact error:', error);
      return { success: false };
    }
  },
};

export default sosService;