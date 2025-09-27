import apiService from './apiService';

const notificationService = {
  // Get all notifications
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/notifications?${queryString}` : '/notifications';
      
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get notification by ID
  getById: async (id) => {
    try {
      const response = await apiService.get(`/notifications/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  // Create new notification
  create: async (notificationData) => {
    try {
      const response = await apiService.post('/notifications', notificationData);
      return response;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const response = await apiService.put(`/notifications/${id}/mark-read`);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark notification as unread
  markAsUnread: async (id) => {
    try {
      const response = await apiService.put(`/notifications/${id}/mark-unread`);
      return response;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiService.put('/notifications/mark-all-read');
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Archive notification
  archive: async (id) => {
    try {
      const response = await apiService.put(`/notifications/${id}/archive`);
      return response;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  },

  // Unarchive notification
  unarchive: async (id) => {
    try {
      const response = await apiService.put(`/notifications/${id}/unarchive`);
      return response;
    } catch (error) {
      console.error('Error unarchiving notification:', error);
      throw error;
    }
  },

  // Delete notification
  delete: async (id) => {
    try {
      const response = await apiService.delete(`/notifications/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Bulk delete notifications
  bulkDelete: async (ids) => {
    try {
      const response = await apiService.delete('/notifications/bulk-delete', { ids });
      return response;
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      throw error;
    }
  },

  // Get notification statistics
  getStats: async () => {
    try {
      const response = await apiService.get('/notifications-stats');
      return response;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }
};

export default notificationService;