import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Info,
  X,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Archive,
  RefreshCw,
  BellRing,
  UserPlus,
  CalendarCheck,
  CalendarX,
  Activity,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    setNotifications
  } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [stats, setStats] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notifications from API
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        await fetchNotifications();
        const statsData = await fetchStats();
        if (isMounted) {
          setStats(statsData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to connect to server');
          console.error('Error loading notifications:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Remove dependencies to prevent re-fetching

  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    try {
      await fetchNotifications();
      const statsData = await fetchStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    const statsData = await fetchStats();
    setStats(statsData);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    const statsData = await fetchStats();
    setStats(statsData);
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    await deleteNotification(id);
    const statsData = await fetchStats();
    setStats(statsData);
  };

  const handleArchiveNotification = async (id) => {
    await archiveNotification(id);
    const statsData = await fetchStats();
    setStats(statsData);
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'appointment_created': CalendarCheck,
      'appointment_updated': Calendar,
      'appointment_cancelled': CalendarX,
      'appointment_confirmed': CheckCircle,
      'appointment_completed': Activity,
      'patient_registered': UserPlus,
      'patient_updated': User,
      'billing_created': Banknote,
      'system_alert': AlertTriangle,
      'default': Bell
    };
    return iconMap[type] || iconMap.default;
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      'urgent': 'from-red-500 to-red-600',
      'high': 'from-orange-500 to-orange-600',
      'medium': 'from-blue-500 to-blue-600',
      'low': 'from-gray-500 to-gray-600'
    };
    return colorMap[priority] || colorMap.medium;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'unread': 'bg-blue-100 text-blue-800 border-blue-200',
      'read': 'bg-gray-100 text-gray-600 border-gray-200',
      'archived': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return statusStyles[status] || statusStyles.unread;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <BellRing className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Notification Center
                </h1>
                <p className="text-gray-600">Stay updated with real-time clinic activities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All Read
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Unread</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.unread || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Today</p>
                  <p className="text-2xl font-bold text-green-900">{stats.today || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Urgent</p>
                  <p className="text-2xl font-bold text-red-900">{stats.priority_stats?.urgent || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="appointment_created">Appointments</option>
              <option value="patient_registered">Patients</option>
              <option value="system_alert">System</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search or filters' : 'All caught up! No new notifications.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const isUnread = notification.status === 'unread';
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 transition-all hover:shadow-2xl ${
                    isUnread ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getPriorityColor(notification.priority)} text-white flex-shrink-0`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {isUnread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(notification.status)}`}>
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            {notification.patient && (
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {notification.patient.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleArchiveNotification(notification.id)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;