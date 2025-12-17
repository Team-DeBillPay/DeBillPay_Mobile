import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { notificationApi } from '../api/notificationApi';
import ScreenWrapper from '../components/ScreenWrapper';

type NotificationItem = {
  id: number;
  type: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
  ebillId?: number;
  senderId?: number;
};

const AUTO_MARK_READ_DELAY = 3000;

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hasMarkedAsReadRef = useRef(false);
  const isScreenFocusedRef = useRef(false);
  const markAsReadTimeoutRef = useRef<number | null>(null);
  const notificationsRef = useRef<NotificationItem[]>([]);

  notificationsRef.current = notifications;

  const loadNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await notificationApi.getAll();
      
      if (Array.isArray(data)) {
        const validData: NotificationItem[] = data
          .filter((item: any) => item && item.id && item.message)
          .map((item: any) => ({
            ...item,
            status: item.status || 'read',
            createdAt: item.createdAt || new Date().toISOString()
          }));
        
        setNotifications(validData);

        const unreadCount = validData.filter(n => n.status === 'unread').length;
        if (unreadCount > 0 && isScreenFocusedRef.current && !hasMarkedAsReadRef.current) {
          startAutoMarkReadTimer();
        }
        
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const startAutoMarkReadTimer = () => {
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }

    markAsReadTimeoutRef.current = setTimeout(() => {
      if (isScreenFocusedRef.current && !hasMarkedAsReadRef.current) {
        markAllAsReadSilently();
      }
    }, AUTO_MARK_READ_DELAY);
  };

  const cancelAutoMarkReadTimer = () => {
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
      markAsReadTimeoutRef.current = null;
    }
  };

  const markAllAsReadSilently = async () => {
    if (hasMarkedAsReadRef.current) return;
    
    const unreadCount = notificationsRef.current.filter(n => n.status === 'unread').length;
    if (unreadCount === 0) {
      hasMarkedAsReadRef.current = true;
      return;
    }
    
    try {
      setNotifications(prev => prev.map(notif => ({ ...notif, status: 'read' })));
      hasMarkedAsReadRef.current = true;

      notificationApi.markAllAsRead().catch(error => {
        console.error('Failed to mark notifications as read on server:', error);
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    cancelAutoMarkReadTimer();

    if (notification.status === 'unread') {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notification.id ? { ...notif, status: 'read' } : notif
        )
      );

      try {
        await notificationApi.markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    if (notification.type === 'friend_invitation') {
      navigation.navigate('Invitations');
    } else if (notification.ebillId) {
      navigation.navigate('EbillDetails', { ebillId: notification.ebillId });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    hasMarkedAsReadRef.current = false;
    cancelAutoMarkReadTimer();
    await loadNotifications(false);
  };

  const handleRefreshPress = () => {
    if (!loading && !refreshing) {
      onRefresh();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      
      const init = async () => {
        isScreenFocusedRef.current = true;
        hasMarkedAsReadRef.current = false;
        
        if (isActive) {
          await loadNotifications();
        }
      };
      
      init();
      
      return () => {
        isActive = false;
        isScreenFocusedRef.current = false;
        cancelAutoMarkReadTimer();

        if (!hasMarkedAsReadRef.current) {
          const hasUnread = notificationsRef.current.some(n => n.status === 'unread');
          if (hasUnread) {
            markAllAsReadSilently();
          }
        }
      };
    }, [])
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'щойно';
      if (diffMins < 60) return `${diffMins} хв тому`;
      if (diffHours < 24) return `${diffHours} год тому`;
      if (diffDays === 1) return 'вчора';
      if (diffDays < 7) return `${diffDays} дн тому`;
      
      return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'friend_invitation':
      case 'invitation':
        return 'person-add';
      case 'ebill_created':
      case 'bill_created':
        return 'receipt-outline';
      case 'ebill_updated':
      case 'bill_updated':
        return 'create-outline';
      case 'payment':
      case 'payment_received':
        return 'wallet-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'friend_invitation':
      case 'invitation':
        return 'Запрошення';
      case 'ebill_created':
      case 'bill_created':
        return 'Чек створено';
      case 'ebill_updated':
      case 'bill_updated':
        return 'Чек оновлено';
      case 'payment':
      case 'payment_received':
        return 'Платіж';
      default:
        return 'Сповіщення';
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <ScreenWrapper>
      <View style={styles.outerCard}>
        <View style={styles.innerCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Мої повідомлення</Text>
              {unreadCount > 0 && (
                <Text style={styles.unreadCount}>
                  {unreadCount} непрочитан{unreadCount === 1 ? 'е' : 'их'}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handleRefreshPress}
              style={[
                styles.refreshBtn,
                (loading || refreshing) && styles.refreshBtnDisabled
              ]}
              disabled={loading || refreshing}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={loading || refreshing ? '#CCCCCC' : '#0E2740'} 
              />
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color="#456DB4"
              style={styles.loader}
            />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#456DB4']}
                  tintColor="#456DB4"
                />
              }
            >
              {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off" size={60} color="#6B7A8A" />
                  <Text style={styles.emptyText}>Немає сповіщень</Text>
                  <Text style={styles.emptySubText}>
                    Тут будуть з'являтися ваші сповіщення
                  </Text>
                </View>
              ) : (
                notifications.map((notification) => {
                  const isUnread = notification.status === 'unread';
                  const iconName = getNotificationIcon(notification.type);
                  const typeText = getNotificationTypeText(notification.type);

                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationCard,
                        isUnread && styles.unreadCard,
                      ]}
                      onPress={() => handleNotificationPress(notification)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name={iconName as any}
                          size={24}
                          color="#456DB4"
                        />
                      </View>
                      <View style={styles.content}>
                        <View style={styles.notificationHeader}>
                          <Text style={styles.typeText}>{typeText}</Text>
                          <Text style={styles.dateText}>
                            {formatDate(notification.createdAt)}
                          </Text>
                        </View>
                        <Text style={styles.messageText} numberOfLines={3}>
                          {notification.message}
                        </Text>
                        {isUnread && (
                          <View style={styles.footer}>
                            <View style={styles.statusBadge}>
                              <View style={styles.unreadDot} />
                              <Text style={styles.statusText}>Непрочитане</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  outerCard: {
    width: '90%',
    height: '85%',
    maxWidth: 360,
    alignSelf: 'center',
    borderRadius: 22,
    backgroundColor: '#B6CDFF',
    padding: 12,
    marginBottom: 20,
  },
  innerCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#0E2740',
    fontWeight: '700',
  },
  unreadCount: {
    fontSize: 14,
    color: '#456DB4',
    marginTop: 4,
    fontWeight: '500',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnDisabled: {
    backgroundColor: '#F5F5F5',
  },
  loader: {
    marginTop: 30,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: '#0E2740',
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubText: {
    textAlign: 'center',
    color: '#6B7A8A',
    marginTop: 8,
    fontSize: 14,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F8FF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E8EFFD',
  },
  unreadCard: {
    backgroundColor: '#EDF3FF',
    borderColor: '#D4E1FF',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeText: {
    fontSize: 12,
    color: '#6B7A8A',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    color: '#8A9BB2',
  },
  messageText: {
    color: '#0E2740',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#456DB4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default NotificationsScreen;