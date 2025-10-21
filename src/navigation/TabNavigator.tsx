import ChecksScreen from '@/screens/ChecksScreen';
import ContactsScreen from '@/screens/ContactsScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, ViewStyle } from 'react-native';

const Tab = createBottomTabNavigator();

type Props = { onNavigate?: (screen: 'login' | 'register1' | 'register2' | 'app') => void };

const TabNavigator: React.FC<Props> = ({ onNavigate }) => {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#CDE9FF',
          tabBarInactiveTintColor: '#8A9BB0',
          tabBarStyle: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 12,
            height: 72,
            borderRadius: 16,
            backgroundColor: 'rgba(7,17,42,0.98)',
            paddingBottom: 8,
            elevation: 8,
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 6,
          },
          tabBarIcon: ({ color, size, focused }) => {
            const bg = focused ? 'rgba(255,255,255,0.06)' : 'transparent';
            const iconSize = 22;
            const circleStyle: ViewStyle = { width: 44, height: 44, borderRadius: 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' };

            if (route.name === 'Profile') {
              return (
                <View style={circleStyle}>
                  <Ionicons name="person-outline" size={iconSize} color={color} />
                </View>
              );
            }
            if (route.name === 'Checks') {
              return (
                <View style={circleStyle}>
                  <MaterialIcons name="receipt-long" size={iconSize} color={color} />
                </View>
              );
            }
            if (route.name === 'Contacts') {
              return (
                <View style={circleStyle}>
                  <MaterialIcons name="contacts" size={iconSize} color={color} />
                </View>
              );
            }
            if (route.name === 'Notifications') {
              return (
                <View style={circleStyle}>
                  <MaterialIcons name="notifications" size={iconSize} color={color} />
                </View>
              );
            }
            return null;
          },
        })}
      >
  <Tab.Screen name="Profile" options={{ title: 'Профіль' }}>
    {() => <ProfileScreen onNavigate={onNavigate}  />}
  </Tab.Screen>
        <Tab.Screen name="Checks" component={ChecksScreen} options={{ title: 'Чеки' }} />
        <Tab.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Контакти' }} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Повідомлення' }} />
      </Tab.Navigator>
  );
};

export default TabNavigator;
