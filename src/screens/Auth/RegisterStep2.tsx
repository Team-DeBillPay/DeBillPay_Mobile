import React from 'react';
import { Image, Text } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import ScreenWrapper from '../../components/ScreenWrapper';

type Props = { onNavigate?: (screen: 'login' | 'register1' | 'register2' | 'app') => void };

const RegisterStep2: React.FC<Props> = ({ onNavigate }) => {
  return (
    <ScreenWrapper>
      <Card>
  <Image source={require('../../../assets/images/logo.png')} style={{ width: 100, height: 32, alignSelf: 'flex-start', marginLeft: 6, marginBottom: 6 }} resizeMode="contain" />
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0E2740', marginVertical: 6 }}>Реєстрація</Text>
        <Text style={{ fontSize: 13, color: '#6B7A8A', textAlign: 'center', marginBottom: 10 }}>Вкажіть додаткові дані</Text>

        <Input placeholder="Номер телефону" />
        <Input placeholder="Електронна пошта" />
  <Input placeholder="Пароль" secureTextEntry />

  <Button onPress={() => onNavigate?.('app')} style={{ marginTop: 12 }}>Зареєструватися</Button>
      </Card>
    </ScreenWrapper>
  );
};

export default RegisterStep2;
