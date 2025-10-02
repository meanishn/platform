import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card, Button, Badge, Input } from '../../components/ui';
import { formatDistanceToNow } from 'date-fns';

interface NotificationFilters {
  category: string;
  type: string;
  read: string;
}

export const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    unreadCount 
  } = useNotifications();

  const [filters, setFilters] = useState<NotificationFilters>({
    category: 'all',
    type: 'all',
    read: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info':
      default: return 'ℹ️';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'service_request': return '🛠️';
      case 'payment': return '💰';
      case 'provider_update': return '👷';
      case 'system': return '⚙️';
      case 'promotion': return '🎉';
      default: return '📢';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'service_request': return 'blue';
      case 'payment': return 'green';
      case 'provider_update': return 'purple';
      case 'system': return 'gray';
      case 'promotion': return 'yellow';
      default: return 'default';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesCategory = filters.category === 'all' || notification.category === filters.category;
    const matchesType = filters.type === 'all' || notification.type === filters.type;
    const matchesRead = filters.read === 'all' || 
      (filters.read === 'read' && notification.read) ||
      (filters.read === 'unread' && !notification.read);
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesType && matchesRead && matchesSearch;
  });

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        markAsRead(id);
      }
    });
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => removeNotification(id));
    setSelectedNotifications([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-700">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
            <Button variant="outline" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="service_request">Service Requests</option>
              <option value="payment">Payments</option>
              <option value="provider_update">Provider Updates</option>
              <option value="system">System</option>
              <option value="promotion">Promotions</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            <select
              value={filters.read}
              onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedNotifications.length} notification(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkMarkAsRead}>
                  Mark as read
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                  Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedNotifications([])}>
                  Deselect all
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Select all</span>
            </label>
          </div>

          {filteredNotifications.map((notification) => (
            <Card key={notification.id}>
              <div className={`p-6 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">
                        {getCategoryIcon(notification.category)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <Badge variant={getCategoryColor(notification.category)} size="sm">
                        {notification.category.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm">
                        {getNotificationIcon(notification.type)}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                      {notification.actionText && (
                        <span className="text-blue-600 font-medium">
                          {notification.actionText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeNotification(notification.id)}
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
        <Card>
          <div className="p-8 text-center">
            <div className="text-gray-600 text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-700">
              {searchTerm || filters.category !== 'all' || filters.type !== 'all' || filters.read !== 'all'
                ? "Try adjusting your filters or search term."
                : "You're all caught up! New notifications will appear here."
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
