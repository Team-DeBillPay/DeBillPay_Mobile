import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';

type Props = { onNavigate?: (screen: 'login' | 'register1' | 'register2' | 'app') => void };

const ProfileScreen: React.FC<Props> = ({ onNavigate }) => {
	const [lastName, setLastName] = useState('Паяльникович');
	const [firstName, setFirstName] = useState('Михайло');
	const [phone, setPhone] = useState('+380607765488');
	const [email, setEmail] = useState('umalso@gmail.com');
	const [password, setPassword] = useState('***************');
	const [editing, setEditing] = useState(false);
	const [tmpLast, setTmpLast] = useState(lastName);
	const [tmpFirst, setTmpFirst] = useState(firstName);
	const [tmpPhone, setTmpPhone] = useState(phone);
	const [tmpEmail, setTmpEmail] = useState(email);
	const [tmpPassword, setTmpPassword] = useState('');
	const [tmpNewPassword, setTmpNewPassword] = useState('');

	const startEdit = () => {
		setTmpLast(lastName);
		setTmpFirst(firstName);
		setTmpPhone(phone);
		setTmpEmail(email);
		setTmpPassword('');
		setTmpNewPassword('');
		setEditing(true);
	};

	const cancelEdit = () => {
		setEditing(false);
	};

	const saveEdit = () => {
		setLastName(tmpLast);
		setFirstName(tmpFirst);
		setPhone(tmpPhone);
		setEmail(tmpEmail);
		if (tmpNewPassword) {
			setPassword('***************');
		}
		setEditing(false);
	};

	return (
		<ScreenWrapper>
			{!editing && (
				<View style={styles.header}>
					<Image source={require('../../assets/images/logo_white.png')} style={styles.topLogo} resizeMode="contain" />
				</View>
			)}

			<View style={[styles.outerCard, editing && styles.cardEditing]}>
				<View style={styles.topInner}>
					<Text style={styles.profileTitle}>Особистий кабінет</Text>
					<View style={styles.avatarWrap}>
						<View style={styles.avatarCircle}>
							<Text style={styles.avatarIcon}>👤</Text>
						</View>
					</View>
					{!editing ? (
						<View style={styles.namePlainRowCentered}>
							<Text style={styles.namePlainTextCentered}>{lastName} {firstName}</Text>
						</View>
					) : (
						<View style={styles.nameInputsContainer}>
							<TextInput style={styles.nameInput} value={tmpLast} onChangeText={setTmpLast} placeholder="Прізвище" />
							<TextInput style={styles.nameInput} value={tmpFirst} onChangeText={setTmpFirst} placeholder="Ім'я" />
						</View>
					)}
				</View>
				<View style={styles.bottomInner}>
					<Text style={styles.fieldLabel}>Номер телефону</Text>
					<TextInput style={styles.input} value={editing ? tmpPhone : phone} onChangeText={editing ? setTmpPhone : undefined} placeholderTextColor="#6B7A8A" />
					<Text style={styles.fieldLabel}>Адреса електронної пошти</Text>
					<TextInput style={styles.input} value={editing ? tmpEmail : email} onChangeText={editing ? setTmpEmail : undefined} placeholderTextColor="#6B7A8A" />
					<Text style={styles.fieldLabel}>Пароль</Text>
					<TextInput style={styles.input} value={password} placeholderTextColor="#6B7A8A" secureTextEntry />

					{editing && (
						<>
							<Text style={styles.fieldLabel}>Новий пароль</Text>
							<TextInput style={styles.input} value={tmpNewPassword} onChangeText={setTmpNewPassword} placeholderTextColor="#6B7A8A" secureTextEntry />
						</>
					)}
					<View style={{ height: 8 }} />
				</View>
				<View style={styles.outerButtons}>
					{!editing ? (
						<>
							<TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={startEdit}>
								<Text style={styles.secondaryButtonText}>Редагувати</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={() => onNavigate?.('login')}>
								<Text style={styles.logoutButtonText}>Вийти з системи</Text>
							</TouchableOpacity>
						</>
					) : (
						<>
							<TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={saveEdit}>
								<Text style={styles.saveButtonText}>Зберегти зміни</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={cancelEdit}>
								<Text style={styles.cancelButtonText}>Скасувати</Text>
							</TouchableOpacity>
						</>
					)}
				</View>
			</View>

			<View style={styles.bottomSpacer} />
		</ScreenWrapper>
	);
};

const styles = StyleSheet.create({
		container: {
			flex: 1,
			alignItems: 'center',
		},
	header: {
		width: '100%',
			paddingTop: 28,
			paddingLeft: 20,
			position: 'absolute',
			top: 12,
			left: 12,
	},
		topLogo: {
			width: 140,
			height: 42,
		},
	card: {
		width: 320,
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		marginTop: 12,
			paddingVertical: 18,
			alignItems: 'center',
	},
		profileTitle: {
			fontSize: 20,
			fontWeight: '700',
			color: '#0E2740',
			marginTop: 8,
			marginBottom: 12,
		},
	avatarWrap: {
			marginTop: 12,
			marginBottom: 12,
	},
	avatarCircle: {
			width: 96,
			height: 96,
			borderRadius: 48,
			backgroundColor: '#CDE9FF',
			alignItems: 'center',
			justifyContent: 'center',
	},
	avatarIcon: {
		fontSize: 36,
	},
	name: {
		fontSize: 16,
		fontWeight: '700',
		color: '#0E2740',
		marginBottom: 10,
	},
		fieldLabel: {
			alignSelf: 'flex-start',
			marginLeft: 18,
			fontSize: 12,
			color: '#6B7A8A',
			marginTop: 6,
		},
	input: {
		width: '90%',
		height: 42,
		borderWidth: 1,
		borderColor: '#C9D6E6',
		borderRadius: 10,
		paddingHorizontal: 10,
		marginTop: 8,
		color: '#0E2740',
	},
	buttonRow: {
		flexDirection: 'row',
		width: '90%',
		justifyContent: 'space-between',
		marginTop: 12,
	},
	secondaryButton: {
		width: '48%',
		height: 40,
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
        borderWidth: 1,
		borderColor: '#C9D6E6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondaryButtonText: {
		color: '#0E2740',
		fontWeight: '600',
	},
	logoutButton: {
		width: '48%',
		height: 40,
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#C9D6E6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoutButtonText: {
		color: '#0E2740',
		fontWeight: '600',
	},
	bottomSpacer: {
		height: 110,
	},
	namePills: {
		flexDirection: 'row',
		width: '90%',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	namePill: {
		flex: 1,
		marginHorizontal: 6,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: '#C9D6E6',
		borderRadius: 10,
		alignItems: 'center',
		backgroundColor: '#FFFFFF'
	},
	namePillText: {
		color: '#0E2740',
		fontWeight: '700',
	},
	nameInput: {
		width: '90%',
		height: 42,
		borderWidth: 1,
		borderColor: '#C9D6E6',
		borderRadius: 10,
		paddingHorizontal: 10,
		marginTop: 8,
		color: '#0E2740',
	},
	outerCard: {
		width: 340,
		backgroundColor: '#B6CDFF',
		borderRadius: 22,
		marginTop: 12,
		alignItems: 'center',
		padding: 12,
	},
	innerCard: {
		width: 320,
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		paddingVertical: 18,
		alignItems: 'center',
	},
	cardEditing: {
		marginTop: 80,
	},
	namePlainRow: {
		width: '90%',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	namePlainText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#0E2740',
	},
	topInner: {
		width: '100%',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		paddingVertical: 12,
		marginBottom: 12,
	},
	nameInputsContainer: {
		width: '100%',
		alignItems: 'center',
		paddingVertical: 6,
	},
	bottomInner: {
		width: '100%',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		paddingVertical: 12,
	},
	namePlainRowCentered: {
		width: '100%',
		alignItems: 'center',
		marginBottom: 8,
	},
	namePlainTextCentered: {
		fontSize: 16,
		fontWeight: '700',
		color: '#0E2740',
		textAlign: 'center',
	},
	outerButtons: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 18,
		marginTop: 12,
		paddingBottom: 8,
	},
	saveButton: {
		width: '48%',
		height: 40,
		backgroundColor: '#3E74D6',
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	saveButtonText: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	cancelButton: {
		width: '48%',
		height: 40,
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#C9D6E6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cancelButtonText: {
		color: '#0E2740',
		fontWeight: '600',
	},
});

export default ProfileScreen;
