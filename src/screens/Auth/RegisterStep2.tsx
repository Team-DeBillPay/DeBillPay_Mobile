import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, Image, Text } from 'react-native';
import { RootStackParamList } from '../../../App';
import { authApi } from '../../api/authApi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { handleApiError } from '../../utils/errorHandler';

type RegisterStep2RouteProp = RouteProp<RootStackParamList, 'RegisterStep2'>;
type RegisterStep2NavProp = StackNavigationProp<RootStackParamList, 'RegisterStep2'>;

const RegisterStep2: React.FC = () => {
  const route = useRoute<RegisterStep2RouteProp>();
  const navigation = useNavigation<RegisterStep2NavProp>();
  const { firstName, lastName } = route.params;
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

    setIsLoading(true);
    try {
      await authApi.register({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
      });

      const loginResponse = await authApi.login({ email, password });
      await login(loginResponse.token, loginResponse.user);

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

        <Text style={{ marginTop: 14, color: '#2f67b6ff', textDecorationLine: 'underline' }} onPress={() => navigation.goBack()}>Повернутися назад</Text>
      </Card>
    </ScreenWrapper>
  );
};

export default RegisterStep2;