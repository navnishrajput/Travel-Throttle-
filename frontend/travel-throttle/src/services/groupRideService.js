import api from './api';

const GROUP_RIDE_ENDPOINTS = {
    BASE: '/group-rides',
    MY: '/group-rides/my',
    BY_ID: (id) => `/group-rides/${id}`,
    JOIN: (id) => `/group-rides/${id}/join`,
    APPROVE: (id) => `/group-rides/members/${id}/approve`,
    REJECT: (id) => `/group-rides/members/${id}/reject`,
    CANCEL: (id) => `/group-rides/${id}/cancel`,
    LEAVE: (id) => `/group-rides/${id}/leave`,
    START: (id) => `/group-rides/${id}/start`,
    COMPLETE: (id) => `/group-rides/${id}/complete`,
};

export const groupRideService = {
    createGroupRide: async (data) => {
        const response = await api.post(GROUP_RIDE_ENDPOINTS.BASE, data);
        return { success: response?.success, data: response?.data, error: response?.message };
    },
    
    getUpcomingGroupRides: async () => {
        const response = await api.get(GROUP_RIDE_ENDPOINTS.BASE);
        return { success: true, data: response?.data || [] };
    },
    
    getMyGroupRides: async () => {
        const response = await api.get(GROUP_RIDE_ENDPOINTS.MY);
        return { success: true, data: response?.data || [] };
    },
    
    getGroupRide: async (groupId) => {
        const response = await api.get(GROUP_RIDE_ENDPOINTS.BY_ID(groupId));
        return { success: response?.success, data: response?.data };
    },
    
    joinGroupRide: async (groupId, bikeId, message) => {
        const response = await api.post(GROUP_RIDE_ENDPOINTS.JOIN(groupId), null, {
            params: { bikeId, message }
        });
        return { success: response?.success, data: response?.data, error: response?.message };
    },
    
    approveMember: async (memberId) => {
        const response = await api.put(GROUP_RIDE_ENDPOINTS.APPROVE(memberId));
        return { success: response?.success, data: response?.data };
    },
    
    rejectMember: async (memberId) => {
        const response = await api.put(GROUP_RIDE_ENDPOINTS.REJECT(memberId));
        return { success: response?.success };
    },
    
    cancelGroupRide: async (groupId) => {
        const response = await api.put(GROUP_RIDE_ENDPOINTS.CANCEL(groupId));
        return { success: response?.success };
    },
    
    leaveGroupRide: async (groupId) => {
        const response = await api.delete(GROUP_RIDE_ENDPOINTS.LEAVE(groupId));
        return { success: response?.success };
    },
    
    startGroupRide: async (groupId) => {
        const response = await api.put(GROUP_RIDE_ENDPOINTS.START(groupId));
        return { success: response?.success };
    },
    
    completeGroupRide: async (groupId) => {
        const response = await api.put(GROUP_RIDE_ENDPOINTS.COMPLETE(groupId));
        return { success: response?.success };
    },
};

export default groupRideService;