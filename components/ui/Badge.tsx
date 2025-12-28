import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/Theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },

  // Sizes
  sm: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },
  lg: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },

  // Variants
  success: {
    backgroundColor: '#d1fae5',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  error: {
    backgroundColor: '#fee2e2',
  },
  info: {
    backgroundColor: '#dbeafe',
  },
  neutral: {
    backgroundColor: '#f1f5f9',
  },
  premium: {
    backgroundColor: '#fef3c7',
  },

  // Text base
  text: {
    fontWeight: Typography.fontWeight.semibold,
  },

  // Text sizes
  smText: {
    fontSize: Typography.fontSize.xs,
  },
  mdText: {
    fontSize: Typography.fontSize.sm,
  },
  lgText: {
    fontSize: Typography.fontSize.base,
  },

  // Text colors
  successText: {
    color: '#065f46',
  },
  warningText: {
    color: '#92400e',
  },
  errorText: {
    color: '#991b1b',
  },
  infoText: {
    color: '#1e40af',
  },
  neutralText: {
    color: '#475569',
  },
  premiumText: {
    color: '#92400e',
  },
});

export default Badge;
