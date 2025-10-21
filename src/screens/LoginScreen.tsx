import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import GoogleButton from '../components/GoogleButton';
import Input from '../components/Input';
import ScreenWrapper from '../components/ScreenWrapper';

type Props = {
	onNavigate?: (screen: 'login' | 'register1' | 'register2' | 'app') => void;
};

const LoginScreen: React.FC<Props> = ({ onNavigate }) => {
	return (
			<ScreenWrapper>
				<Card style={{ paddingHorizontal: 20 }}>
					<Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
					<Text style={styles.title}>Вхід</Text>

					<Input placeholder="Телефон / електронна пошта" />
					<Input placeholder="Пароль" secureTextEntry />

					<TouchableOpacity style={styles.forgotContainer} activeOpacity={0.7}>
						<Text style={styles.forgotText}>Забули пароль</Text>
					</TouchableOpacity>

					<Text style={styles.smallText}>Ще немає аккаунта? <Text style={styles.link} onPress={() => onNavigate?.('register1')}>Зареєструватися</Text></Text>

					<Button variant="primary" onPress={() => onNavigate?.('app')}>
						Увійти
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
