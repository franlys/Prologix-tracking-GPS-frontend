import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../constants/Theme';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  gradient?: string[];
  onPress?: () => void;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  onPress,
  trend,
}) => {
  const content = (
    <>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {trend && (
        <View style={styles.trend}>
          <Text style={[styles.trendText, trend.isPositive ? styles.positive : styles.negative]}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </Text>
        </View>
      )}
    </>
  );

  if (gradient) {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
      <Wrapper onPress={onPress} activeOpacity={0.8} style={styles.container}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {content}
        </LinearGradient>
      </Wrapper>
    );
  }

  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} activeOpacity={0.8} style={[styles.container, styles.card]}>
      {content}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.sm,
  },
  gradientCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  value: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  trend: {
    marginTop: Spacing.xs,
  },
  trendText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
});

export default StatsCard;
