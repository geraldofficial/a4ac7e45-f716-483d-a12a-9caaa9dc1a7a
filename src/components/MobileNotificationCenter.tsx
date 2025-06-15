
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check, ChevronDown } from 'lucide-react';
import { notificationsService, AppNotification } from '@/services/notifications';
import { useNavigate } from 'react-router-dom';

export const MobileNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    notificationsService.requestPermission();
  }, []);

  const loadNotifications = async () => {
    const allNotifications = await notificationsService.getNotifications();
    const unread = await notificationsService.getUnreadCount();
    
    setNotifications(allNotifications);
    setUnreadCount(unread);
  };

  const markAsRead = async (notificationId: string) => {
    await notificationsService.markAsRead(notificationId);
    loadNotifications();
  };

  const markAllAsRead = async () => {
    await notificationsService.markAllAsRead();
    loadNotifications();
  };

  const handleNotificationClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'new_content': return '🎬';
      case 'watch_party': return '👥';
      case 'recommendation': return '⭐';
      default: return '📢';
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-300 hover:text-white hover:bg-white/10 p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-600 min-w-[20px]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Mobile-Optimized Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="fixed top-16 left-4 right-4 max-h-[70vh] z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-300" />
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="bg-red-600">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-gray-300 hover:text-white h-8 px-2"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-white h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No notifications yet</p>
                  <p className="text-gray-500 text-xs mt-1">
                    We'll notify you about new content and updates
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-gray-800 active:bg-gray-700 ${
                        !notification.isRead ? 'bg-gray-800/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-white line-clamp-1">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                            {notification.actionUrl && (
                              <ChevronDown className="h-3 w-3 text-gray-500 rotate-[-90deg]" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700 bg-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-gray-300 hover:text-white"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
