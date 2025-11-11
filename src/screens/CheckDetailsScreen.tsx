import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ebillApi } from '../api/ebillApi';
import { userApi } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';

type BackendParticipantDto = {
    userId: number;
    paymentStatus: 'погашений' | 'частково погашений' | 'непогашений' | string;
    assignedAmount: number;
    paidAmount: number;
    balance: number;
    isAdminRights: boolean;
};

type EbillDto = {
    ebillId: number;
    name: string;
    currency?: string;
    amountOfDept: number;
    description?: string;
    scenario: string;
    status: 'закритий' | 'активний' | string;
    createdAt: string;
    updatedAt: string;
    participants: BackendParticipantDto[];
};

type ContactDto = {
    contactId: number;
    status: string;
    friend: {
        userId: number;
        firstName: string;
        lastName: string;
        email?: string;
        phoneNumber?: string;
    };
};

type Member = {
    id: number;
    name: string;
    assigned: number;
    paid: number;
    spent?: number;
    debt: number;
    status: 'погашений' | 'частково погашений' | 'непогашений' | string;
    isAdmin: boolean;
};

type RouteParams = { ebillId: number };

const CheckDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { ebillId } = route.params as RouteParams;
    const { user } = useAuth();

    const [ebill, setEbill] = useState<EbillDto | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [organizerName, setOrganizerName] = useState<string>('—');
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

    const normalizeName = (first?: string, last?: string) =>
        `${last ?? ''} ${first?.[0] ?? ''}.`.trim();

    const formatMoney = (v: number | undefined) =>
        `${(v ?? 0).toString()} ${ebill?.currency || 'грн'}`;

    useEffect(() => {
        void loadDetails();
    }, []);

    const loadDetails = async () => {
        try {
            const data = (await ebillApi.getEbillById(ebillId)) as EbillDto;
            setEbill(data);

            const contacts = (await userApi.getContacts()) as ContactDto[];
            const isShared = data.scenario === 'спільні витрати';

            const allMembers: Member[] = (data.participants || []).map((p: BackendParticipantDto) => {
                const isMe = p.userId === user?.id;
                const contact = contacts.find((c) => c.friend.userId === p.userId);

                let name = `User #${p.userId}`;
                if (isMe && user) name = `${user.lastName} ${user.firstName?.[0]}. (Я)`;
                else if (contact) name = normalizeName(contact.friend.firstName, contact.friend.lastName);

                const paid = isShared ? p.balance : p.paidAmount;
                const spent = isShared ? p.paidAmount : undefined;
                const debt = Math.max(p.assignedAmount - (paid ?? 0), 0);

                return {
                    id: p.userId,
                    name,
                    assigned: p.assignedAmount,
                    paid,
                    spent,
                    debt,
                    status: p.paymentStatus,
                    isAdmin: p.isAdminRights,
                };
            });

            const org = allMembers.find((m) => m.isAdmin);
            setOrganizerName(org?.name ?? '—');

            const visibleMembers: Member[] =
                data.scenario === 'спільні витрати' ? allMembers : allMembers.filter((m) => !m.isAdmin);

            setMembers(visibleMembers);

            const defaultSelected =
                visibleMembers.find((m) => m.id === user?.id)?.id ??
                visibleMembers[0]?.id ??
                org?.id ??
                null;

            setSelectedMemberId(defaultSelected);
        } catch (e) {
            console.log('Error loading ebill:', e);
            navigation.goBack();
        }
    };

    const selectedMember: Member | null = useMemo(() => {
        if (selectedMemberId == null) return null;
        return members.find((m) => m.id === selectedMemberId) ?? null;
    }, [members, selectedMemberId]);

    const gridItems: Array<Member | { placeholder: true; key: string }> = useMemo(() => {
        const items: Array<Member | { placeholder: true; key: string }> = [...members];
        const remainder = members.length % 3;
        if (remainder !== 0) {
            const need = 3 - remainder;
            for (let i = 0; i < need; i++) items.push({ placeholder: true, key: `ph-${i}` });
        }
        return items;
    }, [members]);

    if (!ebill) {
        return (
            <ScreenWrapper>
                <Text style={{ textAlign: 'center', color: '#0E2740', marginTop: 120 }}>
                    Завантаження...
                </Text>
            </ScreenWrapper>
        );
    }

    const allPaid = members.length > 0 && members.every((m) => m.status === 'погашений');
    const hasPartial = members.some((m) => m.status === 'частково погашений');
    const allUnpaid = members.length > 0 && members.every((m) => m.status === 'непогашений');

    let progressText = 'Не погашений';
    let progressBg = '#FFACAE';
    if (allPaid) { progressText = 'Повністю погашений'; progressBg = '#E5F9EC'; }
    else if (hasPartial) { progressText = 'Частково погашений'; progressBg = '#FEEBBB'; }

    const topStatusText = ebill.status === 'закритий' ? 'Закритий' : 'Активний';
    const isMySelected = selectedMember && user ? selectedMember.id === user.id : false;

    const infoAssigned = selectedMember?.assigned ?? 0;
    const infoSpent = selectedMember?.spent ?? undefined;
    const infoPaid = selectedMember?.paid ?? 0;
    const infoDebt = selectedMember?.debt ?? 0;
    const isSharedScenario = ebill.scenario === 'спільні витрати';

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
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
                            <Ionicons name="arrow-back" size={24} color="#0E2740" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerIconBtn}
                            activeOpacity={0.8}
                            onPress={() => console.log('Налаштування чеку')}
                        >
                            <Ionicons name="settings-outline" size={20} color="#0E2740" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        <Text style={styles.title}>Про чек</Text>
                        <Text style={styles.billName}>Назва: “{ebill.name}”</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Опис:</Text>
                            <Text style={styles.value}>{ebill.description || '—'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Статус:</Text>
                            <View style={styles.statusCell}>
                                <View style={styles.statusActive}>
                                    <Text style={styles.statusText}>{topStatusText}</Text>
                                </View>
                                <View style={[styles.statusPartial, { backgroundColor: progressBg }]}>
                                    <Text style={styles.statusTextPartial}>{progressText}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Сценарій:</Text>
                            <Text style={styles.value}>{ebill.scenario}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Організатор:</Text>
                            <Text style={styles.value}>{organizerName}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Загальна сума:</Text>
                            <Text style={styles.value}>{formatMoney(ebill.amountOfDept)}</Text>
                        </View>

                        <Text style={[styles.label, { marginTop: 16 }]}>Учасники:</Text>

                        <View style={styles.membersGrid}>
                            {gridItems.map((item, idx) => {
                                const isPlaceholder = (item as any).placeholder === true;
                                const key = isPlaceholder ? (item as any).key : (item as Member).id.toString();
                                const isSelected = !isPlaceholder && (item as Member).id === selectedMemberId;

                                const isThird = (idx + 1) % 3 === 0;
                                const cardStyle: StyleProp<ViewStyle> = [
                                    styles.memberBtn,
                                    {
                                        marginRight: isThird ? 0 : 8,
                                        marginBottom: 8,
                                        flexBasis: '31%',
                                        maxWidth: '31%',
                                        opacity: isPlaceholder ? 0 : 1,
                                        borderWidth: isSelected ? 2 : 0,
                                        borderColor: isSelected ? '#0E2740' : 'transparent',
                                    },
                                ];

                                if (isPlaceholder) return <View key={key} style={cardStyle} />;

                                const m = item as Member;
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={cardStyle}
                                        activeOpacity={0.8}
                                        onPress={() => setSelectedMemberId(m.id)}
                                    >
                                        <Text style={styles.memberText}>{m.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.box}>
                            <View style={styles.boxRow}>
                                <Text style={styles.boxLabel}>
                                    {isMySelected ? 'Моя частка:' : 'Його/її частка:'}
                                </Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.boxValue}>{formatMoney(infoAssigned)}</Text>
                                </View>
                            </View>

                            {isSharedScenario && (
                                <View style={styles.boxRow}>
                                    <Text style={styles.boxLabel}>Витратив:</Text>
                                    <View style={styles.valueBox}>
                                        <Text style={styles.boxValue}>{formatMoney(infoSpent)}</Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.boxRow}>
                                <Text style={styles.boxLabel}>Сплатив:</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.boxValue}>{formatMoney(infoPaid)}</Text>
                                </View>
                            </View>

                            <View style={styles.boxRow}>
                                <Text style={styles.boxLabel}>Борг:</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.boxValue}>{formatMoney(infoDebt)}</Text>
                                </View>
                            </View>

                            {isMySelected && (
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={styles.payBtn}
                                    onPress={() => console.log('Оплатити')}
                                >
                                    <Ionicons name="card-outline" size={18} color="#0E2740" style={{ marginRight: 6 }} />
                                    <Text style={styles.payBtnText}>Оплатити</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
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
        borderRadius: 22,
        backgroundColor: '#B6CDFF',
        padding: 12,
    },
    innerCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingTop: 16,
        paddingHorizontal: 14,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0E2740',
        textAlign: 'center'
    },
    billName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0E2740',
        textAlign: 'center',
        marginBottom: 18,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 6,
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0E2740'
    },
    value: {
        fontSize: 14,
        color: '#24364B',
        maxWidth: '60%',
        textAlign: 'right'
    },
    statusCell: {
        flexShrink: 1,
        alignItems: 'flex-end',
        gap: 6,
        maxWidth: '65%'
    },
    statusActive: {
        backgroundColor: '#7BE495',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    statusText: {
        color: '#ffffffff',
        fontSize: 13,
        fontWeight: '600'
    },
    statusPartial: {
        backgroundColor: '#FFEFBF',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    statusTextPartial: {
        color: '#0E2740',
        fontSize: 13,
        fontWeight: '600'
    },
    membersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
    },
    memberBtn: {
        backgroundColor: '#B6CDFF',
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    memberText: {
        color: '#0E2740',
        fontWeight: '600',
        fontSize: 13
    },
    box: {
        backgroundColor: '#B6CDFF',
        borderRadius: 10,
        padding: 12,
        marginTop: 16,
        gap: 12,
    },
    boxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    boxLabel: {
        color: '#0E2740',
        fontWeight: '600'
    },
    valueBox: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    boxValue: {
        color: '#0E2740',
        fontWeight: '600'
    },
    headerIconBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#EEF5FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D7E4F5',
    },
    payBtn: {
        marginTop: 8,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#456DB4',
        borderWidth: 1,
        borderColor: '#D7E4F5',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    payBtnText: {
        color: '#ffffffff',
        fontWeight: '700'
    },
});

export default CheckDetailsScreen;
