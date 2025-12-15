import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { ebillApi } from '../api/ebillApi';
import { useAuth } from '../contexts/AuthContext';

type NavProp = StackNavigationProp<RootStackParamList, 'CreateEbillStep3'>;

const CreateEbillStep3: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<any>();
    const { user } = useAuth();
    const { name, description, scenario, currency, participants, total } = route.params;
    const [card, setCard] = useState('');
    const [loading, setLoading] = useState(false);

    
    const formatCardNumber = (value: string) => {
        const clean = value.replace(/\D/g, '');
        const parts = [];
        for (let i = 0; i < clean.length; i += 4) {
            parts.push(clean.slice(i, i + 4));
        }
        return parts.join(' ');
    };

    const validateCard = (cardNumber: string) => {
        const clean = cardNumber.replace(/\s/g, '');
        if (clean.length !== 16) return false;

        let sum = 0;
        let shouldDouble = false;
        
        for (let i = clean.length - 1; i >= 0; i--) {
            let digit = parseInt(clean.charAt(i));
            
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return sum % 10 === 0;
    };

    const createBill = async () => {
        const cleanCard = card.replace(/\s/g, '');

        if (!cleanCard || cleanCard.length !== 16) {
            Alert.alert("Помилка", "Введіть коректний номер картки (16 цифр)");
            return;
        }
        
        if (!/^\d+$/.test(cleanCard)) {
            Alert.alert("Помилка", "Номер картки має містити тільки цифри");
            return;
        }
        
        if (!validateCard(card)) {
            Alert.alert("Помилка", "Номер картки недійсний. Перевірте правильність введення");
            return;
        }

        setLoading(true);

        try {
            const dto: any = {
                Name: name,
                Description: description || "",
                Scenario: scenario,
                Currency: currency.toUpperCase(),
                AmountOfDept: total,
                Participants: participants
            };

            const response = await ebillApi.createEbill(dto);

            Alert.alert(
                "Успіх!",
                "Чек успішно створено!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Tabs' }]
                            });
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error("Ошибка при создании чека:", error);
            
            let errorMessage = "Не вдалося створити чек";
            
            if (error.response?.data) {
                const data = error.response.data;
                if (data.error) {
                    errorMessage = data.error;
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (typeof data === 'string') {
                    errorMessage = data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert("Помилка", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const getScenarioDisplayName = (scenario: string) => {
        const map: {[key: string]: string} = {
            'рівний розподіл': 'Рівний розподіл',
            'індивідуальні суми': 'Індивідуальні суми',
            'спільні витрати': 'Спільні витрати'
        };
        return map[scenario] || scenario;
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

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Підсумок</Text>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Назва:</Text>
                            <Text style={styles.summaryValue} numberOfLines={2}>{name}</Text>
                        </View>
                        
                        {description ? (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Опис:</Text>
                                <Text style={styles.summaryValue} numberOfLines={3}>{description}</Text>
                            </View>
                        ) : null}
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Сценарій:</Text>
                            <Text style={styles.summaryValue}>{getScenarioDisplayName(scenario)}</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Валюта:</Text>
                            <Text style={styles.summaryValue}>{currency}</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Учасників:</Text>
                            <Text style={styles.summaryValue}>{participants.length}</Text>
                        </View>
                        
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Загальна сума:</Text>
                            <Text style={styles.totalValue}>
                                {total.toFixed(2)} {currency}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.label}>Номер Вашої карти</Text>
                    <TextInput
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor="#6B7A8A"
                        style={styles.input}
                        keyboardType="numeric"
                        value={formatCardNumber(card)}
                        onChangeText={(v) => {
                            const clean = v.replace(/\D/g, '');
                            if (clean.length <= 16) {
                                setCard(clean);
                            }
                        }}
                        maxLength={19}
                        editable={!loading}
                    />

                    <View style={styles.bottomButtons}>
                        <TouchableOpacity 
                            style={[styles.backBtn, loading && styles.disabledBtn]} 
                            onPress={handleBack}
                            disabled={loading}
                        >
                            <Text style={[styles.btnText, styles.backBtnText]}>Назад</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.createBtn, loading && styles.disabledBtn]} 
                            onPress={createBill}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.btnText}>Створити</Text>
                            )}
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
        fontWeight: '600',
        marginTop: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#C9D6E6',
        borderRadius: 12,
        padding: 12,
        color: '#0E2740',
        marginBottom: 16,
        fontSize: 16
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 14
    },
    backBtn: {
        backgroundColor: '#EEF5FF',
        borderRadius: 16,
        paddingVertical: 14,
        width: '45%',
        borderWidth: 1,
        borderColor: '#D7E4F5'
    },
    createBtn: {
        backgroundColor: '#3E74D6',
        borderRadius: 16,
        paddingVertical: 14,
        width: '45%'
    },
    disabledBtn: {
        opacity: 0.6
    },
    btnText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700'
    },
    backBtnText: {
        color: '#0E2740'
    },
    summaryCard: {
        backgroundColor: '#F6F9FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#D7E4F5'
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0E2740',
        marginBottom: 12,
        textAlign: 'center'
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'flex-start'
    },
    summaryLabel: {
        color: '#6B7A8A',
        fontSize: 14,
        flex: 1
    },
    summaryValue: {
        color: '#0E2740',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right'
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#D7E4F5'
    },
    totalLabel: {
        color: '#0E2740',
        fontSize: 16,
        fontWeight: '700',
        flex: 1
    },
    totalValue: {
        color: '#3E74D6',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'right'
    }
});

export default CreateEbillStep3;