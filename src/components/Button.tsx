import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import theme from '../styles/theme';

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  fullWidth?: boolean;
  disabled?:boolean;
};

const Button: React.FC<Props> = ({ children, variant = 'primary', style, textStyle, onPress, fullWidth = true }) => {
  const backgroundColor = variant === 'primary' ? theme.colors.lightPrimary : '#FFFFFF';
  return (
    <TouchableOpacity style={[styles.button, fullWidth ? styles.fullWidth : null, { backgroundColor }, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 46,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    color: theme.colors.text,
    fontWeight: '700',
  },
});

export default Button;
