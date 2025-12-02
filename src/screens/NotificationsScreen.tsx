import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      console.log('Notifications data:', data);

      if (Array.isArray(data)) {
        console.log('Total notifications:', data.length);
        console.log('Sample notification:', data[0]);
        setNotifications(data);
      } else {
        console.warn('Expected array but got:', typeof data, data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити сповіщення');
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.status === 'unread');
    if (unreadNotifications.length === 0) return;

    try {
      const unreadIds = unreadNotifications.map(n => n.id);
      const markPromises = unreadIds.map(id => notificationApi.markAsRead(id));
      await Promise.all(markPromises);

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, status: 'read' }))
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      return () => {
        if (notifications.length > 0) {
          markAllAsRead();
        }
      };
    }, [])
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_invitation':
        return 'person-add';
      case 'ebill_created':
        return 'receipt-outline';
      case 'ebill_updated':
        return 'create-outline';
      case 'payment_success':
        return 'checkmark-circle-outline';
      case 'payment_failed':
        return 'close-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_invitation':
        return '#456DB4';
      case 'ebill_created':
      case 'ebill_updated':
        return '#34C759';
      case 'payment_success':
        return '#30B0C7';
      case 'payment_failed':
        return '#FF3B30';
      default:
        return '#6B7A8A';
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'friend_invitation':
        return 'Запрошення';
      case 'ebill_created':
        return 'Чек створено';
      case 'ebill_updated':
        return 'Чек оновлено';
      case 'payment_success':
        return 'Оплата';
      case 'payment_failed':
        return 'Помилка оплати';
      default:
        return 'Сповіщення';
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (notification.status === 'unread') {
      try {
        await notificationApi.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notification.id ? { ...notif, status: 'read' } : notif
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    if (notification.type === 'friend_invitation') {
      navigation.navigate('Invitations' as never);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <ScreenWrapper>
      <View style={styles.outerCard}>
        <View style={styles.innerCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Сповіщення</Text>
              {unreadCount > 0 && (
                <Text style={styles.unreadCount}>
                  {unreadCount} непрочитаних
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={loadNotifications} 
              style={styles.refreshBtn}
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
                  const iconColor = getNotificationColor(notification.type);
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
                          color={iconColor}
                        />
                      </View>
                      <View style={styles.content}>
                        <View style={styles.notificationHeader}>
                          <Text style={styles.typeText}>{typeText}</Text>
                          <Text style={styles.dateText}>
                            {formatDate(notification.createdAt)}
                          </Text>
                        </View>
                        <Text style={styles.messageText}>
                          {notification.message}
                        </Text>
                        <View style={styles.footer}>
                          <View style={styles.statusContainer}>
                            {isUnread ? (
                              <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Нове</Text>
                              </View>
                            ) : (
                              <View style={styles.statusBadgeRead}>
                                <Ionicons 
                                  name="checkmark-done" 
                                  size={14} 
                                  color="#34C759" 
                                />
                                <Text style={styles.statusTextRead}>Прочитано</Text>
                              </View>
                            )}
                          </View>
                        </View>
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
    fontSize: 12,
    color: '#6B7A8A',
  },
  messageText: {
    color: '#0E2740',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusContainer: {
    alignSelf: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#456DB4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeRead: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextRead: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NotificationsScreen;