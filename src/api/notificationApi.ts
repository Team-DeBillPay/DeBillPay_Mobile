import { apiClient } from './apiClient';

export const notificationApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/notifications/all');
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      const response = await apiClient.put(`/api/notifications/mark-read/${notificationId}`);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
};