import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';

const ChecksScreen: React.FC = () => (
  <ScreenWrapper>
    <Text style={styles.text}>Чеки (заглушка)</Text>
  </ScreenWrapper>
);

const styles = StyleSheet.create({
  text: { color: '#fff' },
});

export default ChecksScreen;
