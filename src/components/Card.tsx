import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import theme from '../styles/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const Card: React.FC<Props> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
});

export default Card;
