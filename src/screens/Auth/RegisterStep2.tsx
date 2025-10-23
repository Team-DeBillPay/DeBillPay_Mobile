import React, { useState } from 'react';
import { Alert, Image, Text } from 'react-native';
import { authApi } from '../../api/authApi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { handleApiError } from '../../utils/errorHandler';

type Props = { 
  onNavigate?: (screen: 'login' | 'register1' | 'register2' | 'app') => void;
  step1Data?: { firstName: string; lastName: string };
};

const RegisterStep2: React.FC<Props> = ({ onNavigate, step1Data }) => {
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!phoneNumber || !email || !password) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Помилка', 'Пароль повинен містити щонайменше 6 символів');
      return;
    }

    if (!step1Data) {
      Alert.alert('Помилка', 'Дані з першого кроку не знайдені');
      return;
    }

    setIsLoading(true);
    try {
      const registerData = {
        ...step1Data,
        email,
        phoneNumber,
        password
      };

      await authApi.register(registerData);

      const loginResponse = await authApi.login({ email, password });
      await login(loginResponse.token, loginResponse.user);
      
      onNavigate?.('app');
    } catch (error: any) {
      const userFriendlyError = handleApiError(error);
      Alert.alert('Помилка', userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Card>
        <Image source={require('../../../assets/images/logo.png')} style={{ width: 100, height: 32, alignSelf: 'flex-start', marginLeft: 6, marginBottom: 6 }} resizeMode="contain" />
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0E2740', marginVertical: 6 }}>Реєстрація</Text>
        <Text style={{ fontSize: 13, color: '#6B7A8A', textAlign: 'center', marginBottom: 10 }}>Вкажіть додаткові дані</Text>

        <Input 
          placeholder="Номер телефону" 
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Input 
          placeholder="Електронна пошта" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input 
          placeholder="Пароль" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        <Button 
          onPress={handleRegister} 
          style={{ marginTop: 12 }}
          disabled={isLoading}
        >
          {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
        </Button>
      </Card>
    </ScreenWrapper>
  );
};

export default RegisterStep2;