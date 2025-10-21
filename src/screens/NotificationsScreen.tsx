import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';

const NotificationsScreen: React.FC = () => (
  <ScreenWrapper>
    <Text style={styles.text}>Повідомлення (заглушка)</Text>
  </ScreenWrapper>
);

const styles = StyleSheet.create({
  text: { color: '#fff' },
});

export default NotificationsScreen;
