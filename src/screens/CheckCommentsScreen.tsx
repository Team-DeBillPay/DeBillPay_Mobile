import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ebillApi } from '../api/ebillApi';
import { useAuth } from '../contexts/AuthContext';

type RouteParams = { ebillId: number };

type Comment = {
    commentId: number;
    text: string;
    createdAt: string;
    user: {
        userId: number;
        firstName: string;
        lastName: string;
    };
};

const CheckCommentsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { ebillId } = route.params as RouteParams;
    const { user } = useAuth();

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [newComment, setNewComment] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        void loadComments();
    }, []);

    const loadComments = async () => {
        setLoading(true);
        try {
            const response = await ebillApi.getComments(ebillId);
            const data = response.data || response;

            if (Array.isArray(data)) {
                const sortedComments = data.sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                setComments(sortedComments);
            } else {
                console.error('Expected array but got:', data);
                setComments([]);
            }
        } catch (err: any) {
            Alert.alert('Помилка', 'Не вдалося завантажити коментарі');
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const sendComment = async () => {
        if (!newComment.trim()) {
            Alert.alert('Увага', 'Введіть текст коментаря');
            return;
        }

        setSending(true);
        try {
            const commentDto = {
                ebillId,
                text: newComment.trim()
            };

            const response = await ebillApi.createComment(commentDto);
            const createdComment = response.data || response;

            setComments(prev => [...prev, createdComment]);
            setNewComment('');

            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (err: any) {
            Alert.alert('Помилка', 'Не вдалося надіслати коментар');
        } finally {
            setSending(false);
        }
    };

    const refreshComments = () => {
        loadComments();
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'щойно';
            if (diffMins < 60) return `${diffMins} хв тому`;
            if (diffHours < 24) return `${diffHours} год тому`;
            if (diffDays === 1) return 'Вчора';
            if (diffDays < 7) return `${diffDays} дн тому`;

            return date.toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleTimeString('uk-UA', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    const getUserDisplayName = (commentUser: Comment['user']) => {
        const isMe = user?.id === commentUser.userId;
        const name = `${commentUser.lastName} ${commentUser.firstName?.[0] ?? ''}.`.trim();
        return isMe ? `${name} (Я)` : name;
    };

    return (
        <ScreenWrapper>
            <View style={styles.logoWrap}>
                <Image
                    source={require('../../assets/images/logo_white.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.outerCard}>
                <View style={styles.innerCard}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#0E2740" />
                    </TouchableOpacity>

                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Коментарі до чека</Text>
                        <TouchableOpacity onPress={refreshComments} style={styles.refreshBtn}>
                            <Ionicons name="refresh" size={20} color="#0E2740" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#456DB4" style={{ marginTop: 30 }} />
                    ) : (
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                        >
                            <ScrollView
                                ref={scrollViewRef}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={() => {
                                    if (comments.length > 0) {
                                        scrollViewRef.current?.scrollToEnd({ animated: false });
                                    }
                                }}
                            >
                                {comments.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="chatbubble-outline" size={60} color="#B6CDFF" />
                                        <Text style={styles.emptyText}>Немає коментарів</Text>
                                        <Text style={styles.emptySubText}>Будьте першим, хто залишить коментар</Text>
                                    </View>
                                ) : (
                                    comments.map((comment) => {
                                        const isMyComment = user?.id === comment.user.userId;

                                        return (
                                            <View
                                                key={comment.commentId}
                                                style={[
                                                    styles.commentContainer,
                                                    isMyComment ? styles.myCommentContainer : styles.otherCommentContainer
                                                ]}
                                            >
                                                <View style={[
                                                    styles.commentCard,
                                                    isMyComment && styles.myCommentCard
                                                ]}>
                                                    <View style={styles.commentHeader}>
                                                        <View style={styles.userInfo}>
                                                            <View style={styles.avatar}>
                                                                <Ionicons
                                                                    name="person-circle-outline"
                                                                    size={24}
                                                                    color={isMyComment ? "#456DB4" : "#0E2740"}
                                                                />
                                                            </View>
                                                            <Text style={[
                                                                styles.userName,
                                                                isMyComment && styles.myUserName
                                                            ]}>
                                                                {getUserDisplayName(comment.user)}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.timeContainer}>
                                                            <Text style={styles.time}>
                                                                {formatTime(comment.createdAt)}
                                                            </Text>
                                                            <Text style={styles.date}>
                                                                {formatDate(comment.createdAt)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text style={styles.commentText}>
                                                        {comment.text}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </ScrollView>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Напишіть коментар..."
                                    placeholderTextColor="#A0AFC6"
                                    value={newComment}
                                    onChangeText={setNewComment}
                                    multiline
                                    maxLength={500}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!newComment.trim() || sending) && styles.sendButtonDisabled
                                    ]}
                                    onPress={sendComment}
                                    disabled={!newComment.trim() || sending}
                                >
                                    {sending ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Ionicons name="send" size={20} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    logoWrap: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 15
    },
    logo: {
        width: 140,
        height: 42
    },
    outerCard: {
        width: '90%',
        height: '85%',
        maxWidth: 360,
        alignSelf: 'center',
        borderRadius: 22,
        backgroundColor: '#B6CDFF',
        padding: 12,
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#0E2740',
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubText: {
        fontSize: 14,
        color: '#6B7A8A',
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 20,
    },
    commentContainer: {
        marginBottom: 12,
    },
    myCommentContainer: {
        marginLeft: 40,
        marginRight: 0,
    },
    otherCommentContainer: {
        marginLeft: 0,
        marginRight: 40,
    },
    commentCard: {
        backgroundColor: '#F6F9FF',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E6F1FF',
    },
    myCommentCard: {
        backgroundColor: '#E6F1FF',
        borderColor: '#B6CDFF',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        marginRight: 8,
    },
    userName: {
        color: '#0E2740',
        fontWeight: '600',
        fontSize: 14,
    },
    myUserName: {
        color: '#456DB4',
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    time: {
        color: '#456DB4',
        fontSize: 12,
        fontWeight: '600',
    },
    date: {
        color: '#6B7A8A',
        fontSize: 11,
        marginTop: 2,
    },
    commentText: {
        color: '#0E2740',
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E6F1FF',
        paddingTop: 12,
        marginTop: 8,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F6F9FF',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        paddingTop: 10,
        fontSize: 14,
        color: '#0E2740',
        borderWidth: 1,
        borderColor: '#E6F1FF',
        maxHeight: 100,
        minHeight: 44,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#456DB4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#A0AFC6',
        opacity: 0.7,
    },
});

export default CheckCommentsScreen;