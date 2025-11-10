import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CheckDetails'>;

const CheckDetailsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const ebill = {
        title: 'Пікнік',
        description: 'За їжу яку ви їли',
        organizer: 'Денис (Я)',
        total: 1000,
        members: ['Віктор O.', 'Дмитро К.', 'Людмила O.', 'Влад К.'],
        share: 250,
        paid: 0,
        debt: 250,
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
                            <Ionicons name="arrow-back" size={24} color="#0E2740" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerIconBtn}
                            activeOpacity={0.8}
                            onPress={() => console.log('Открыть настройки чека')}
                        >
                            <Ionicons name="settings-outline" size={20} color="#0E2740" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        <Text style={styles.title}>Про чек</Text>
                        <Text style={styles.billName}>Назва: “{ebill.title}”</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Опис:</Text>
                            <Text style={styles.value}>{ebill.description}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Статус:</Text>
                            <View style={styles.statusCell}>
                                <View style={styles.statusActive}>
                                    <Text style={styles.statusText}>Активний</Text>
                                </View>
                                <View style={styles.statusPartial}>
                                    <Text style={styles.statusTextPartial}>Частково погашений</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Сценарій:</Text>
                            <Text style={styles.value}>Індивідуальні суми</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Організатор:</Text>
                            <Text style={styles.value}>{ebill.organizer}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Загальна сума:</Text>
                            <Text style={styles.value}>{ebill.total} грн</Text>
                        </View>

                        <Text style={[styles.label, { marginTop: 16 }]}>Учасники:</Text>
                        <View style={styles.membersList}>
                            {ebill.members.map((m, i) => (
                                <View key={i} style={styles.memberBtn}>
                                    <Text style={styles.memberText}>{m}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.box}>
                            <View style={styles.boxRow}>
                                <Text style={styles.boxLabel}>Його/її частка:</Text>
                                <View style={styles.valueBox}><Text style={styles.boxValue}>{ebill.share} грн</Text></View>
                            </View>

                            <View style={styles.boxRow}>
                                <Text style={styles.boxLabel}>Сплатив:</Text>
                                <View style={styles.valueBox}><Text style={styles.boxValue}>{ebill.paid} грн</Text></View>
                            </View>

                            <View style={styles.boxRow}>
                                <Text style={styles.boxLabel}>Борг:</Text>
                                <View style={styles.valueBox}><Text style={styles.boxValue}>{ebill.debt} грн</Text></View>
                            </View>
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
    backBtn: {
        marginBottom: 10
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
        marginBottom: 18
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
        maxWidth: '65%',
    },
    statusActive: {
        backgroundColor: '#E0F8D3',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    statusText: {
        color: '#2E8B00',
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
        color: '#AF8400',
        fontSize: 13,
        fontWeight: '600'
    },
    membersList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    memberBtn: {
        width: '31%',
        backgroundColor: '#B6CDFF',
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 8,
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
        alignItems: 'center',
    },
    boxLabel: {
        color: '#0E2740',
        fontWeight: '600'
    },
    valueBox: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    boxValue: {
        color: '#0E2740',
        fontWeight: '600'
    },
    topIconsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        marginBottom: 4,
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
});

export default CheckDetailsScreen;
