import ChecksScreen from '@/screens/ChecksScreen';
import ContactsScreen from '@/screens/ContactsScreen';
import CreateEbillStep1 from '@/screens/CreateEbillStep1';
import NotificationsScreen from '@/screens/NotificationsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
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
          bottom: 0,
          height: 84,
          borderRadius: 16,
          backgroundColor: 'rgba(7,17,42,0.98)',
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          borderTopWidth: 0,
          overflow: 'visible',
        },
        tabBarIcon: ({ color, focused }) => {
          const bg = focused ? 'rgba(255,255,255,0.06)' : 'transparent';
          const iconSize = 22;
          const circleStyle: ViewStyle = { width: 44, height: 44, borderRadius: 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' };

          switch (route.name) {
            case 'Profile':
              return <View style={circleStyle}><Ionicons name="person-outline" size={iconSize} color={color} /></View>;
            case 'Checks':
              return <View style={circleStyle}><MaterialIcons name="receipt-long" size={iconSize} color={color} /></View>;
            case 'Contacts':
              return <View style={circleStyle}><MaterialIcons name="contacts" size={iconSize} color={color} /></View>;
            case 'Notifications':
              return <View style={circleStyle}><MaterialIcons name="notifications" size={iconSize} color={color} /></View>;
          }
        },
      })}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профіль' }} />
      <Tab.Screen name="Checks" component={ChecksScreen} options={{ title: 'Чеки' }} />
      <Tab.Screen
        name="CreateEbill"
        component={CreateEbillStep1}
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: ({ onPress }) => (
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.9}
              style={{
                position: 'absolute',
                alignSelf: 'center',
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#3E74D6',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
                bottom: 12,
              }}
            >
              <Ionicons name="add" size={34} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Контакти' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Повідомлення' }} />
    </Tab.Navigator>
    
  );
};

export default TabNavigator;