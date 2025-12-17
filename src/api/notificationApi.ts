import { apiClient } from './apiClient';

export const notificationApi = {
  getAll: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/notifications/all');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      console.warn('Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  markAsRead: async (notificationId: number): Promise<any> => {
    try {
      const response = await apiClient.put(`/api/notifications/mark-read/${notificationId}`);
      return response.data || response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (): Promise<{ success: boolean; count: number }> => {
    try {
      const allNotifications = await notificationApi.getAll();
      const unread = allNotifications.filter((n: any) => n.status === 'unread');
      
      if (unread.length === 0) {
        return { success: true, count: 0 };
      }

      const promises = unread.map((n: any) => 
        notificationApi.markAsRead(n.id).catch(() => null)
      );
      
      await Promise.all(promises);
      
      return { success: true, count: unread.length };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, count: 0 };
    }
  }
};