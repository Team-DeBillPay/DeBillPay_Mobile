import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import { RegisterStep1, RegisterStep2 } from './src/screens/Auth';
import LoginScreen from './src/screens/LoginScreen';

const App: React.FC = () => {
	const [screen, setScreen] = useState<'login' | 'register1' | 'register2' | 'app'>('login');

	const handleNavigate = (to: 'login' | 'register1' | 'register2' | 'app') => setScreen(to);

	return (
			<SafeAreaProvider>
				<View style={{ flex: 1 }}>
					{screen === 'login' && <LoginScreen onNavigate={handleNavigate} />}
					{screen === 'register1' && <RegisterStep1 onNavigate={handleNavigate} />}
					{screen === 'register2' && <RegisterStep2 onNavigate={handleNavigate} />}
					{screen === 'app' && <TabNavigator onNavigate={handleNavigate} />}
				</View>
			</SafeAreaProvider>
	);
};

export default App;
