import { NavigationContainer } from '@react-navigation/native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import TabNavigator from './src/navigation/TabNavigator';
import { RegisterStep1, RegisterStep2 } from './src/screens/Auth';
import LoginScreen from './src/screens/LoginScreen';

const AppContent: React.FC = () => {
  const [screen, setScreen] = useState<'login' | 'register1' | 'register2' | 'app'>('login');
  const [registerData, setRegisterData] = useState<{ firstName: string; lastName: string }>();
  const { user, isLoading } = useAuth();
   const handleNavigate = (to: 'login' | 'register1' | 'register2' | 'app') => {
    if (to === 'register1') {
      setRegisterData(undefined);
    }
    setScreen(to);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#07112A' }} />
    );
  }

  if (user) {
    <NavigationContainer>
      <TabNavigator onNavigate={handleNavigate} />
    </NavigationContainer>
  }

  return (
    <View style={{ flex: 1 }}>
		{screen === 'login' && <LoginScreen onNavigate={handleNavigate} />}
		{screen === 'register1' && (
		<RegisterStep1 
			onNavigate={handleNavigate} 
			onSaveStep1={setRegisterData}
		/>
		)}
		{screen === 'register2' && (
		<RegisterStep2 
			onNavigate={handleNavigate} 
			step1Data={registerData}
		/>
		)}
		{screen === 'app' && <TabNavigator onNavigate={handleNavigate} />}
    </View>
  );
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App