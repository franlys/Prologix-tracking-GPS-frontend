import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/Theme';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showValues?: boolean;
  color?: string;
  gradient?: string[];
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  label,
  showValues = true,
  color = Colors.primary[500],
  gradient,
  height = 8,
  style,
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isOverLimit = current > max;

  return (
    <View style={[styles.container, style]}>
      {(label || showValues) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showValues && (
            <Text style={[styles.values, isOverLimit && styles.overLimit]}>
              {current} / {max}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.track, { height }]}>
        {gradient ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
                height,
                backgroundColor: isOverLimit ? Colors.error : undefined,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
                height,
                backgroundColor: isOverLimit ? Colors.error : color,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
  },
  values: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  overLimit: {
    color: Colors.error,
  },
  track: {
    width: '100%',
    backgroundColor: Colors.light.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});

export default ProgressBar;
