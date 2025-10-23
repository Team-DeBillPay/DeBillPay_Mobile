import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { authApi } from '../api/authApi';
import Button from '../components/Button';
import Card from '../components/Card';
import GoogleButton from '../components/GoogleButton';
import Input from '../components/Input';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../utils/errorHandler';

type Props = {
  onNavigate?: (screen: 'login' | 'register1' | 'register2' | 'app') => void;
};

const LoginScreen: React.FC<Props> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      await login(response.token, response.user);
      
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
      <Card style={{ paddingHorizontal: 20 }}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Вхід</Text>

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

        <TouchableOpacity style={styles.forgotContainer} activeOpacity={0.7}>
          <Text style={styles.forgotText}>Забули пароль</Text>
        </TouchableOpacity>

        <Text style={styles.smallText}>
          Ще немає аккаунта? 
          <Text style={styles.link} onPress={() => onNavigate?.('register1')}>Зареєструватися</Text>
        </Text>

        <Button 
          variant="primary" 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Вхід...' : 'Увійти'}
        </Button>

        <GoogleButton onPress={() => console.log('Google sign-in')} />
      </Card>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#07112A',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logo: {
		width: 100,
		height: 32,
		alignSelf: 'flex-start',
		marginLeft: 6,
		marginBottom: 6,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#0E2740',
		marginVertical: 8,
	},
	input: {
		width: '100%',
		height: 44,
		borderWidth: 1,
		borderColor: '#C9D6E6',
		borderRadius: 12,
		paddingHorizontal: 12,
		marginTop: 10,
		color: '#0E2740',
	},
	forgotContainer: {
		alignSelf: 'flex-end',
		marginTop: 6,
	},
	forgotText: {
		color: '#6B7A8A',
		fontSize: 12,
	},
	smallText: {
		fontSize: 13,
		color: '#6B7A8A',
		marginTop: 10,
		textAlign: 'center',
	},
	link: {
		color: '#134E9F',
		textDecorationLine: 'underline',
	},
	primaryButtonText: {
		color: '#0E2740',
		fontWeight: '700',
	},
});

export default LoginScreen;
