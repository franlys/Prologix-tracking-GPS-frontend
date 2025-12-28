import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/Theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'outlined' | 'elevated';
  gradient?: string[];
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  gradient,
  style,
  padding = Spacing.base,
}) => {
  const cardStyle: ViewStyle[] = [
    styles.base,
    { padding },
    styles[variant],
    style,
  ];

  if (variant === 'gradient' && gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyle}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
  },
  default: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  gradient: {
    ...Shadows.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  elevated: {
    backgroundColor: Colors.light.surface,
    ...Shadows.lg,
  },
});

export default Card;
