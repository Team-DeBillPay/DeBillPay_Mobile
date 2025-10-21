import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Card from '../components/Card';
import GoogleButton from '../components/GoogleButton';
import Input from '../components/Input';

type Props = {
	onNavigate?: (screen: 'login' | 'register' | 'profile') => void;
};

const RegisterScreen: React.FC<Props> = ({ onNavigate }) => {
	return (
			<SafeAreaView style={styles.container}>
				<Card>
					<Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
					<Text style={styles.title}>Реєстрація</Text>
					<Text style={styles.subtitle}>Створіть обліковий запис, щоб почати користуватися нашим сервісом</Text>

					<Input placeholder="Ім'я" />
					<Input placeholder="Прізвище" />

					<Text style={styles.smallText}>Вже є аккаунт? <Text style={styles.link} onPress={() => onNavigate?.('login')}>Авторизуватися</Text></Text>

					<Button onPress={() => onNavigate?.('profile')}>Продовжити</Button>

					<GoogleButton />
				</Card>
			</SafeAreaView>
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
		fontSize: 24,
		fontWeight: '700',
		color: '#0E2740',
		marginVertical: 6,
	},
	subtitle: {
		fontSize: 13,
		color: '#6B7A8A',
		textAlign: 'center',
		marginBottom: 10,
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
    
});

export default RegisterScreen;
