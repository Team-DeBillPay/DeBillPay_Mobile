import React from 'react';
import { Image, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import theme from '../styles/theme';

type Props = {
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const GoogleButton: React.FC<Props> = ({ onPress, style, textStyle }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
      <Image source={require('../../assets/images/google_icon.png')} style={styles.icon} />
      <Text style={[styles.text, textStyle]}>Продовжити з Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 46,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: '#E6EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  text: {
    color: theme.colors.text,
  },
});

export default GoogleButton;
