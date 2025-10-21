import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import theme from '../styles/theme';

const Input: React.FC<TextInputProps> = (props) => {
  return <TextInput style={styles.input} placeholderTextColor={theme.colors.muted} {...props} />;
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: 12,
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
  },
});

export default Input;
