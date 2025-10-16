/**
 * Notifications Page
 * 
 * Browse, filter, and manage user notifications.
 * REFACTORED: Following design system and refactor guidelines.
 * Fully responsive with mobile-first design.
 */

import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { 
  Button, 
  SearchBar, 
  FilterSelect, 
  NotificationCard, 
  BulkActionBanner, 
  EmptyState,
  PageContainer,
  PageHeaderActions,
  Checkbox,
} from '../../components/ui';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

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
    <PageContainer maxWidth="7xl">
      {/* Page Header */}
      <PageHeaderActions
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        actions={
          <>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                onClick={markAllAsRead}
                size="sm"
                className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
              >
                <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2} />
                <span className="hidden sm:inline">Mark all as read</span>
                <span className="sm:hidden">Mark read</span>
              </Button>
            )}
            <Button 
              variant="danger" 
              onClick={clearAll}
              size="sm"
              className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2} />
              <span>Clear all</span>
            </Button>
          </>
        }
      />

      {/* Filters and Search */}
      <div className="flex flex-col gap-3">
        <SearchBar
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <FilterSelect
            value={filters.category}
            onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            placeholder="All Categories"
            options={[
              { value: 'service_request', label: 'Service Requests' },
              { value: 'payment', label: 'Payments' },
              { value: 'provider_update', label: 'Provider Updates' },
              { value: 'system', label: 'System' },
              { value: 'promotion', label: 'Promotions' },
            ]}
          />

          <FilterSelect
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            placeholder="All Types"
            options={[
              { value: 'info', label: 'Info' },
              { value: 'success', label: 'Success' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error' },
            ]}
          />

          <FilterSelect
            value={filters.read}
            onChange={(value) => setFilters(prev => ({ ...prev, read: value }))}
            placeholder="All"
            options={[
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ]}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <BulkActionBanner
          selectedCount={selectedNotifications.length}
          onMarkAsRead={handleBulkMarkAsRead}
          onDelete={handleBulkDelete}
          onDeselectAll={() => setSelectedNotifications([])}
        />
      )}

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-3 sm:gap-4">
            <label htmlFor="select-all" className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id="select-all"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={handleSelectAll}
                label="Select all notifications"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium">Select all</span>
            </label>
          </div>

          {/* Notification Cards */}
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isSelected={selectedNotifications.includes(notification.id)}
              onSelect={handleSelectNotification}
              onMarkAsRead={markAsRead}
              onRemove={removeNotification}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description={
            searchTerm || filters.category !== 'all' || filters.type !== 'all' || filters.read !== 'all'
              ? "Try adjusting your filters or search term."
              : "You're all caught up! New notifications will appear here."
          }
        />
      )}
    </PageContainer>
  );
};
