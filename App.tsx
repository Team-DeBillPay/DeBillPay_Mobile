import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import TabNavigator from './src/navigation/TabNavigator';
import AddFriendScreen from './src/screens/AddFriendScreen';
import { RegisterStep1, RegisterStep2 } from './src/screens/Auth';
import CheckDetailsScreen from './src/screens/CheckDetailsScreen';
import CheckHistoryScreen from './src/screens/CheckHistoryScreen';
import CreateEbillStep1 from './src/screens/CreateEbillStep1';
import CreateEbillStep2 from './src/screens/CreateEbillStep2';
import CreateEbillStep3 from './src/screens/CreateEbillStep3';
import InvitationsScreen from './src/screens/InvitationsScreen';
import LoginScreen from './src/screens/LoginScreen';
import WebViewPaymentScreen from './src/screens/WebViewPaymentScreen';

export type RootStackParamList = {
  Login: undefined;
  RegisterStep1: undefined;
  RegisterStep2: { firstName: string; lastName: string };
  Tabs: undefined;
  AddFriend: undefined;
  Invitations: undefined;
  CreateEbillStep1: undefined;
  CreateEbillStep2: { name: string; description: string; scenario: string; currency: string };
  CreateEbillStep3: { name: string; description: string; scenario: string; currency: string; participants: any[]; total?: number };
  CheckDetails: { ebillId: number; paymentSuccess?: boolean; };
  CheckHistory: { ebillId: number };
  WebViewPayment: { data: string; signature: string; onSuccess?: () => void; onFailure?: () => void; ebillId: number; };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>

        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterStep1" component={RegisterStep1} />
            <Stack.Screen name="RegisterStep2" component={RegisterStep2} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="AddFriend" component={AddFriendScreen} />
            <Stack.Screen name="Invitations" component={InvitationsScreen} />
            <Stack.Screen name="CreateEbillStep1" component={CreateEbillStep1} />
            <Stack.Screen name="CreateEbillStep2" component={CreateEbillStep2} />
            <Stack.Screen name="CreateEbillStep3" component={CreateEbillStep3} />
            <Stack.Screen name="CheckDetails" component={CheckDetailsScreen} />
            <Stack.Screen name="CheckHistory" component={CheckHistoryScreen} />
            <Stack.Screen
              name="WebViewPayment"
              component={WebViewPaymentScreen}
              options={{
                headerShown: true,
                title: 'Оплата LiqPay',
                headerStyle: {
                  backgroundColor: '#456DB4',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                  fontWeight: '600',
                },
              }}
            />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}