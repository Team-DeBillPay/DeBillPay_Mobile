import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { ebillApi } from '../api/ebillApi';

type NavProp = StackNavigationProp<RootStackParamList, 'CreateEbillStep3'>;

const CreateEbillStep3: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<any>();
    const { name, description, scenario, currency, participants, total } = route.params;
    const [card, setCard] = useState('');

    type ParticipantDto = {
        UserId: number;
        Amount?: number;
        PaidAmount?: number;
    };

    const createBill = async () => {
        const cleanCard = card.replace(/\s/g, '');

        if (!cleanCard || cleanCard.length !== 16 || !/^\d+$/.test(cleanCard)) {
            Alert.alert("Помилка", "Введіть коректний номер картки (16 цифр)");
            return;
        }

        const dto = {
            Name: name,
            Description: description,
            Scenario: scenario,
            Currency: currency,
            AmountOfDept: total,
            Participants: participants.map((p: ParticipantDto) => ({
                UserId: p.UserId,
                Amount: p.Amount ?? 0,
                PaidAmount: p.PaidAmount ?? 0
            }))
        };

        try {
            await ebillApi.createEbill(dto);
            Alert.alert("Успіх", "Чек створено!");
            navigation.navigate('Tabs');
        } catch (error: any) {
            console.log(error?.response?.data || error);
            Alert.alert("Помилка", error?.response?.data || "Не вдалося створити чек");
        }
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
                    <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={28} color="#0E2740" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Створення чеку</Text>

                    <View style={styles.stepsRow}>
                        <View style={styles.stepCircle}><Text style={styles.stepNum}>1</Text></View>
                        <View style={styles.stepLine} />
                        <View style={styles.stepCircle}><Text style={styles.stepNum}>2</Text></View>
                        <View style={styles.stepLine} />
                        <View style={[styles.stepCircle, styles.stepActive]}><Text style={styles.stepNum}>3</Text></View>
                    </View>

                    <Text style={styles.label}>Номер Вашої карти</Text>
                    <TextInput
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor="#6B7A8A"
                        style={styles.input}
                        keyboardType="numeric"
                        value={card}
                        onChangeText={(v) => setCard(v.replace(/[^0-9\s]/g, ''))}
                        maxLength={19}
                    />

                    <View style={styles.bottomButtons}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.btnText}>Назад</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.createBtn} onPress={createBill}>
                            <Text style={styles.btnText}>Створити</Text>
                        </TouchableOpacity>
                    </View>

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
        zIndex: 10
    },
    logo: {
        width: 140,
        height: 42
    },
    outerCard: {
        width: '90%',
        height: '82%',
        maxWidth: 360,
        alignSelf: 'center',
        borderRadius: 22,
        backgroundColor: '#B6CDFF',
        padding: 12
    },
    innerCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingTop: 18,
        paddingHorizontal: 14
    },
    closeBtn: {
        alignSelf: 'flex-end',
        marginBottom: 6
    },
    title: {
        textAlign: 'center',
        color: '#0E2740',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20
    },
    stepsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 26
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#C9D6E6',
        alignItems: 'center',
        justifyContent: 'center'
    },
    stepActive: {
        backgroundColor: '#3E74D6',
        borderColor: '#3E74D6'
    },
    stepNum: {
        color: '#0E2740',
        fontWeight: '700'
    },
    stepLine: {
        width: 58,
        height: 3,
        backgroundColor: '#C9D6E6',
        marginHorizontal: 6
    },
    label: {
        fontSize: 14,
        color: '#0E2740',
        marginBottom: 6,
        fontWeight: '600'
    },
    input: {
        borderWidth: 1,
        borderColor: '#C9D6E6',
        borderRadius: 12,
        padding: 12,
        color: '#0E2740',
        marginBottom: 16
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 14
    },
    backBtn: {
        backgroundColor: '#3E74D6',
        borderRadius: 16,
        paddingVertical: 14,
        width: '45%'
    },
    createBtn: {
        backgroundColor: '#3E74D6',
        borderRadius: 16,
        paddingVertical: 14,
        width: '45%'
    },
    btnText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700'
    },
});

export default CreateEbillStep3;
