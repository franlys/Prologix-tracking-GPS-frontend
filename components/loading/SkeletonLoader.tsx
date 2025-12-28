import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius } from '../../constants/Theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.light.borderLight,
          overflow: 'hidden',
        },
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
};

// Device Card Skeleton
export const DeviceCardSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.cardHeader}>
        <SkeletonLoader width={48} height={48} borderRadius={BorderRadius.full} />
        <View style={skeletonStyles.cardInfo}>
          <SkeletonLoader width="60%" height={20} />
          <SkeletonLoader width="40%" height={16} style={{ marginTop: 8 }} />
        </View>
      </View>
      <View style={skeletonStyles.cardDetails}>
        <SkeletonLoader width="100%" height={16} />
        <SkeletonLoader width="80%" height={16} style={{ marginTop: 8 }} />
        <SkeletonLoader width="60%" height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.statsCard}>
      <SkeletonLoader width={40} height={40} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="60%" height={16} />
    </View>
  );
};

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.container}>
      {/* Header */}
      <View style={skeletonStyles.header}>
        <SkeletonLoader width="50%" height={32} />
        <SkeletonLoader width="30%" height={20} style={{ marginTop: 8 }} />
      </View>

      {/* Stats */}
      <View style={skeletonStyles.statsRow}>
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </View>
      <View style={skeletonStyles.statsRow}>
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </View>

      {/* Cards */}
      <DeviceCardSkeleton />
      <DeviceCardSkeleton />
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
});

export default SkeletonLoader;
