import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../api/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showNewNotificationAlert, setShowNewNotificationAlert] = useState(false);

  const fetchNotifications = async (params = {}) => {
    try {
      setLoading(true);
      console.log('Fetching notifications...');
      
      const response = await notificationService.getAll(params);
      console.log('Notifications response:', response);
      
      if (response && response.success) {
        const newNotifications = response.data || [];
        setNotifications(newNotifications);
        
        const unread = newNotifications.filter(notif => notif.status === 'unread').length;
        setUnreadCount(unread);
        
        return response;
      } else {
        console.error('Failed to fetch notifications:', response?.message || 'Unknown error');
        setNotifications([]);
        setUnreadCount(0);
        return { success: false, message: response?.message || 'Failed to fetch notifications' };
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      // Don't throw the error, return a failure response instead
      return { success: false, message: error.message || 'Failed to connect to server' };
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await notificationService.getStats();
      
      if (response.success) {
        return response.data || {};
      } else {
        console.error('Failed to fetch stats:', response.message);
        return {};
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {};
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      
      if (response.success) {
        setNotifications(prev => prev.map(notif => 
          notif.id === id ? { ...notif, status: 'read' } : notif
        ));
        
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        return response;
      } else {
        console.error('Failed to mark notification as read:', response.message);
        return response;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, status: 'read' })));
        setUnreadCount(0);
        
        return response;
      } else {
        console.error('Failed to mark all notifications as read:', response.message);
        return response;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await notificationService.delete(id);
      
      if (response.success) {
        const deletedNotif = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        
        if (deletedNotif && deletedNotif.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return response;
      } else {
        console.error('Failed to delete notification:', response.message);
        return response;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const archiveNotification = async (id) => {
    try {
      const response = await notificationService.archive(id);
      
      if (response.success) {
        setNotifications(prev => prev.map(notif => 
          notif.id === id ? { ...notif, status: 'archived' } : notif
        ));
        
        return response;
      } else {
        console.error('Failed to archive notification:', response.message);
        return response;
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchNotifications().catch(error => {
      console.error('Initial fetch failed:', error);
    });
    
    const interval = setInterval(() => {
      fetchNotifications().catch(error => {
        console.error('Periodic fetch failed:', error);
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const contextValue = {
    notifications,
    unreadCount,
    loading,
    showNewNotificationAlert,
    setShowNewNotificationAlert,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    setNotifications,
    setUnreadCount
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;