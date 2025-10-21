import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';

const AppNavigator: React.FC = () => {
	const [selected, setSelected] = useState<'profile' | 'checks' | 'contacts' | 'notifications'>('profile');

	return (
		<View style={styles.container}>
			<View style={styles.contentPlaceholder}>
				{selected === 'profile' && <ProfileScreen />}
				{selected === 'checks' && <Text style={{ color: '#fff' }}>Чеки (заглушка)</Text>}
				{selected === 'contacts' && <Text style={{ color: '#fff' }}>Контакти (заглушка)</Text>}
				{selected === 'notifications' && <Text style={{ color: '#fff' }}>Повідомлення (заглушка)</Text>}
			</View>

			<View style={styles.tabBar}>
				<TouchableOpacity style={styles.tabItem} activeOpacity={0.8} onPress={() => setSelected('profile')}>
					<View style={styles.iconPlaceholder} />
					<Text style={styles.tabText}>Особистий кабінет</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tabItem} activeOpacity={0.8} onPress={() => setSelected('checks')}>
					<View style={styles.iconPlaceholder} />
					<Text style={styles.tabText}>Чеки</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tabItem} activeOpacity={0.8} onPress={() => setSelected('contacts')}>
					<View style={styles.iconPlaceholder} />
					<Text style={styles.tabText}>Контакти</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tabItem} activeOpacity={0.8} onPress={() => setSelected('notifications')}>
					<View style={styles.iconPlaceholder} />
					<Text style={styles.tabText}>Повідомлення</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0E2740',
	},
	contentPlaceholder: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabBar: {
		height: 76,
		backgroundColor: '#07112A',
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		paddingBottom: 12,
	},
	tabItem: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconPlaceholder: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#CDE9FF',
		marginBottom: 6,
	},
	tabText: {
		color: '#FFFFFF',
		fontSize: 11,
	},
});

export default AppNavigator;

