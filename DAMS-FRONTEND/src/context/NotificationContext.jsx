import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [showNewNotificationAlert, setShowNewNotificationAlert] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('http://localhost:8000/api/notifications', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        const newNotifications = result.data || [];
        
        // Check if there are new notifications
        if (newNotifications.length > 0 && lastNotificationId) {
          const hasNewNotifications = newNotifications.some(notif => 
            notif.id > lastNotificationId && notif.status === 'unread'
          );
          if (hasNewNotifications) {
            setShowNewNotificationAlert(true);
            // Auto-hide alert after 5 seconds
            setTimeout(() => setShowNewNotificationAlert(false), 5000);
          }
        }
        
        setNotifications(newNotifications);
        const unread = newNotifications.filter(notif => notif.status === 'unread').length;
        setUnreadCount(unread);
        
        // Update last notification ID
        if (newNotifications.length > 0) {
          setLastNotificationId(Math.max(...newNotifications.map(n => n.id)));
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  // Fetch notification stats
  const fetchStats = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch('http://localhost:8000/api/notifications-stats', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        return result.data || {};
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching notification stats:', error);
      }
    }
    return {};
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`http://localhost:8000/api/notifications/${id}/mark-read`, {
        method: 'PUT',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, status: 'read', read_at: new Date() } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:8000/api/notifications/mark-all-read', {
        method: 'PUT',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, status: 'read', read_at: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const deletedNotification = notifications.find(notif => notif.id === id);
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        if (deletedNotification && deletedNotification.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Archive notification
  const archiveNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${id}/archive`, {
        method: 'PUT'
      });
      if (response.ok) {
        const archivedNotification = notifications.find(notif => notif.id === id);
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        if (archivedNotification && archivedNotification.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  // Clear new notification alert
  const clearNewNotificationAlert = () => {
    setShowNewNotificationAlert(false);
  };

  // Auto-fetch notifications every 30 seconds
  useEffect(() => {
    let intervalId;
    let isMounted = true;
    
    const initializeNotifications = async () => {
      if (isMounted) {
        await fetchNotifications();
      }
    };
    
    initializeNotifications();
    
    // Set up interval only after initial fetch
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Remove dependencies to prevent infinite loops

  const value = {
    notifications,
    unreadCount,
    showNewNotificationAlert,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    clearNewNotificationAlert,
    setNotifications,
    setUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;