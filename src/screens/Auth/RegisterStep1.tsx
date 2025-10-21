import React from 'react';
import { Image, Text } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import GoogleButton from '../../components/GoogleButton';
import Input from '../../components/Input';
import ScreenWrapper from '../../components/ScreenWrapper';

type Props = { onNavigate?: (screen: 'login' | 'register1' | 'register2' | 'app') => void };

const RegisterStep1: React.FC<Props> = ({ onNavigate }) => {
  return (
    <ScreenWrapper>
      <Card>
  <Image source={require('../../../assets/images/logo.png')} style={{ width: 100, height: 32, alignSelf: 'flex-start', marginLeft: 6, marginBottom: 6 }} resizeMode="contain" />
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#0E2740', marginVertical: 6 }}>Реєстрація</Text>
        <Text style={{ fontSize: 13, color: '#6B7A8A', textAlign: 'center', marginBottom: 10 }}>Створіть обліковий запис, щоб почати користуватися нашим сервісом</Text>

        <Input placeholder="Ім'я" />
        <Input placeholder="Прізвище" />

    <Text style={{ fontSize: 13, color: '#6B7A8A', marginTop: 10, textAlign: 'center' }}>Вже є аккаунт? <Text style={{ color: '#134E9F' }} onPress={() => onNavigate?.('login')}>Авторизуватися</Text></Text>

    <Button onPress={() => onNavigate?.('register2')}>Продовжити</Button>
        <GoogleButton />
      </Card>
    </ScreenWrapper>
  );
};

export default RegisterStep1;
