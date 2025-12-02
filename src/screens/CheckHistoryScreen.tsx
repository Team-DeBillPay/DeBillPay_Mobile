import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ebillApi } from '../api/ebillApi';
import { userApi } from '../api/userApi';

type RouteParams = { ebillId: number };

type HistoryItem = {
    ebillHistoryId: number;
    ebillId: number;
    userId: number;
    action: string;
    message: string;
    createdAt: string;
    userName?: string;
};

const CheckHistoryScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { ebillId } = route.params as RouteParams;

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [userNamesCache, setUserNamesCache] = useState<Record<number, string>>({});

    useEffect(() => {
        void loadHistory();
    }, []);

    const getUserName = useCallback(async (userId: number): Promise<string> => {
        if (userNamesCache[userId]) {
            return userNamesCache[userId];
        }

        try {
            const res = await userApi.getUser(userId);
            const userData = res.data || res;
            const firstName = userData.firstName || userData.FirstName || '';
            const lastName = userData.lastName || userData.LastName || '';
            const name = `${firstName} ${lastName}`.trim();

            const finalName = name || `Користувач #${userId}`;

            setUserNamesCache(prev => ({
                ...prev,
                [userId]: finalName
            }));

            return finalName;
        } catch {
            const defaultName = `Користувач #${userId}`;
            setUserNamesCache(prev => ({
                ...prev,
                [userId]: defaultName
            }));
            return defaultName;
        }
    }, [userNamesCache]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await ebillApi.getEbillHistory(ebillId);

            const data: HistoryItem[] = response.data || response;

            if (!Array.isArray(data)) {
                console.error('Expected array but got:', data);
                return;
            }

            const sortedHistory = data.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            const uniqueUserIds = [...new Set(sortedHistory.map(item => item.userId))];

            const namePromises = uniqueUserIds.map(async (userId) => {
                const name = await getUserName(userId);
                return { userId, name };
            });

            const nameResults = await Promise.allSettled(namePromises);

            const newCache = { ...userNamesCache };
            nameResults.forEach(result => {
                if (result.status === 'fulfilled') {
                    newCache[result.value.userId] = result.value.name;
                }
            });

            if (Object.keys(newCache).length > Object.keys(userNamesCache).length) {
                setUserNamesCache(newCache);
            }

            const historyWithNames = sortedHistory.map(item => ({
                ...item,
                userName: newCache[item.userId] || `Користувач #${item.userId}`
            }));

            setHistory(historyWithNames);
        } catch (err) {
            console.log('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshHistory = () => {
        loadHistory();
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.outerCard}>
                <View style={styles.innerCard}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#0E2740" />
                    </TouchableOpacity>

                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Історія змін чека</Text>
                        <TouchableOpacity onPress={refreshHistory} style={styles.refreshBtn}>
                            <Ionicons name="refresh" size={20} color="#0E2740" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#456DB4" style={{ marginTop: 30 }} />
                    ) : (
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 30 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {history.length === 0 ? (
                                <Text style={styles.emptyText}>Історія порожня</Text>
                            ) : (
                                history.map((item) => {
                                    const itemKey = `${item.ebillHistoryId}_${item.userId}_${item.createdAt}`;

                                    return (
                                        <View key={itemKey} style={styles.historyCard}>
                                            <View style={styles.avatar}>
                                                <Ionicons name="person-circle-outline" size={36} color="#0E2740" />
                                            </View>
                                            <View style={styles.content}>
                                                <View style={styles.headerRow}>
                                                    <Text style={styles.userName} numberOfLines={1}>
                                                        {item.userName || `Користувач #${item.userId}`}
                                                    </Text>
                                                    <Text style={styles.date}>
                                                        {formatDate(item.createdAt)}
                                                    </Text>
                                                </View>
                                                <Text style={styles.actionText}>{item.message}</Text>
                                            </View>
                                        </View>
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
        padding: 14,
        paddingTop: 16,
    },
    backBtn: {
        marginBottom: 10,
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EEF5FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: 22,
        color: '#0E2740',
        fontWeight: '700',
    },
    refreshBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EEF5FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7A8A',
        marginTop: 20,
        fontSize: 14,
    },
    historyCard: {
        flexDirection: 'row',
        backgroundColor: '#D8E7FF',
        padding: 12,
        borderRadius: 14,
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    avatar: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    userName: {
        color: '#0E2740',
        fontWeight: '700',
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    date: {
        color: '#6B7A8A',
        fontSize: 12,
    },
    actionText: {
        color: '#0E2740',
        fontSize: 13,
        marginTop: 2,
    },
});

export default CheckHistoryScreen;