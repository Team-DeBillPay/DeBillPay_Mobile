import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { paymentApi } from '../api/paymentApi';

type PaymentModalProps = {
    visible: boolean;
    onClose: () => void;
    ebillId: number;
    currency?: string;
    maxAmount: number;
    currentBalance: number;
    onPaymentSuccess?: () => void;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
    visible,
    onClose,
    ebillId,
    currency = 'грн',
    maxAmount,
    currentBalance,
    onPaymentSuccess,
}) => {
    const navigation = useNavigation<any>();
    const [selectedOption, setSelectedOption] = useState<'full' | 'partial' | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        try {
            setError(null);
            setIsProcessing(true);

            let amount: number;

            if (selectedOption === 'full') {
                amount = maxAmount;
            } else if (selectedOption === 'partial' && customAmount) {
                amount = parseFloat(customAmount);

                if (isNaN(amount) || amount <= 0) {
                    setError('Введіть коректну суму');
                    setIsProcessing(false);
                    return;
                }

                if (amount > maxAmount) {
                    setError(`Сума не може перевищувати ${maxAmount.toFixed(2)} ${currency}`);
                    setIsProcessing(false);
                    return;
                }
            } else {
                setError('Оберіть спосіб оплати');
                setIsProcessing(false);
                return;
            }

            const request = {
                ebillId,
                amount: amount,
            };

            const response = await paymentApi.createPayment(request);

            navigation.navigate('WebViewPayment', {
                data: response.data,
                signature: response.signature,
                onSuccess: () => {
                    onClose();
                    onPaymentSuccess?.();
                    Alert.alert('Успіх', 'Оплата пройшла успішно!');
                },
                onFailure: () => {
                    Alert.alert('Помилка', 'Щось пішло не так при оплаті');
                }
            });

        } catch (err: any) {
            console.error('Payment error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Не вдалося створити платіж';
            setError(errorMessage);
            Alert.alert('Помилка', errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAmountChange = (text: string) => {
        const cleaned = text.replace(/[^0-9.]/g, '');

        const parts = cleaned.split('.');
        if (parts.length > 2) {
            return;
        }

        if (parts[1] && parts[1].length > 2) {
            return;
        }

        setCustomAmount(cleaned);
    };

    const renderPaymentOption = (
        title: string,
        subtitle: string,
        value: 'full' | 'partial',
        icon: string
    ) => (
        <TouchableOpacity
            style={[
                styles.optionCard,
                selectedOption === value && styles.optionCardSelected,
            ]}
            onPress={() => {
                setSelectedOption(value);
                if (value === 'full') {
                    setCustomAmount(maxAmount.toFixed(2));
                } else if (value === 'partial') {
                    setCustomAmount('');
                }
            }}
            disabled={isProcessing}
        >
            <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={24} color="#0E2740" />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{title}</Text>
                    <Text style={styles.optionSubtitle}>{subtitle}</Text>
                </View>
            </View>
            <View style={styles.optionRight}>
                {selectedOption === value && (
                    <Ionicons name="checkmark-circle" size={24} color="#456DB4" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Оплата</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#0E2740" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.balanceInfo}>
                            <Text style={styles.balanceLabel}>Ваш поточний борг:</Text>
                            <Text style={styles.balanceAmount}>
                                {currentBalance.toFixed(2)} {currency}
                            </Text>
                        </View>

                        {renderPaymentOption(
                            'Повна оплата',
                            `Сплатити всю суму: ${maxAmount.toFixed(2)} ${currency}`,
                            'full',
                            'checkmark-done-circle-outline'
                        )}

                        {renderPaymentOption(
                            'Часткова оплата',
                            'Сплатити частину боргу',
                            'partial',
                            'wallet-outline'
                        )}

                        {selectedOption === 'partial' && (
                            <View style={styles.amountInputContainer}>
                                <Text style={styles.amountLabel}>Сума оплати:</Text>
                                <View style={styles.amountInputWrapper}>
                                    <TextInput
                                        style={styles.amountInput}
                                        value={customAmount}
                                        onChangeText={handleAmountChange}
                                        keyboardType="decimal-pad"
                                        placeholder={`Введіть суму (до ${maxAmount.toFixed(2)} ${currency})`}
                                        placeholderTextColor="#A0AFC6"
                                        editable={!isProcessing}
                                        autoFocus={true}
                                    />
                                    <Text style={styles.currencyText}>{currency}</Text>
                                </View>
                                {customAmount && !isNaN(parseFloat(customAmount)) && (
                                    <Text style={styles.remainingText}>
                                        Залишиться сплатити: {Math.max(0, maxAmount - parseFloat(customAmount)).toFixed(2)} {currency}
                                    </Text>
                                )}
                            </View>
                        )}

                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.payButton,
                                (!selectedOption || isProcessing) && styles.payButtonDisabled,
                            ]}
                            onPress={handlePayment}
                            disabled={!selectedOption || isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.payButtonText}>
                                        {selectedOption === 'full'
                                            ? `Оплатити ${maxAmount.toFixed(2)} ${currency}`
                                            : `Оплатити ${customAmount || '...'} ${currency}`}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.disclaimer}>
                            Після підтвердження вас буде перенаправлено на сторінку LiqPay для безпечної оплати.
                        </Text>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0E2740',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        padding: 20,
    },
    balanceInfo: {
        backgroundColor: '#F6F9FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#0E2740',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0E2740',
    },
    optionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F6F9FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        borderColor: '#456DB4',
        backgroundColor: '#E6F1FF',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0E2740',
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 14,
        color: '#666666',
    },
    optionRight: {
        marginLeft: 12,
    },
    amountInputContainer: {
        backgroundColor: '#F6F9FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    amountLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0E2740',
        marginBottom: 8,
    },
    amountInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#D7E4F5',
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#0E2740',
        paddingVertical: 12,
    },
    currencyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0E2740',
        marginLeft: 8,
    },
    remainingText: {
        fontSize: 14,
        color: '#456DB4',
        marginTop: 8,
        fontWeight: '500',
    },
    payButton: {
        backgroundColor: '#456DB4',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
    },
    payButtonDisabled: {
        backgroundColor: '#A0AFC6',
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    disclaimer: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 16,
        paddingHorizontal: 10,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
});

export default PaymentModal;