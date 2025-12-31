import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Theme';

interface CompassLoaderProps {
  size?: number;
}

export const CompassLoader: React.FC<CompassLoaderProps> = ({ size = 120 }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false
    );

    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer circle glow */}
      <View style={[styles.glow, { width: size * 1.3, height: size * 1.3 }]} />

      {/* Compass body */}
      <Animated.View style={[styles.compass, { width: size, height: size }, animatedStyle]}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.compassGradient, { width: size, height: size }]}
        >
          {/* North indicator (red) */}
          <View style={[styles.needle, styles.needleNorth, { top: size * 0.15 }]}>
            <View style={styles.needleArrow} />
          </View>

          {/* South indicator (white) */}
          <View style={[styles.needle, styles.needleSouth, { bottom: size * 0.15 }]}>
            <View style={[styles.needleArrow, styles.needleArrowSouth]} />
          </View>

          {/* Center dot */}
          <View style={styles.centerDot} />

          {/* Cardinal marks */}
          <View style={[styles.cardinalMark, { top: size * 0.05 }]} />
          <View style={[styles.cardinalMark, { bottom: size * 0.05 }]} />
          <View style={[styles.cardinalMark, { left: size * 0.05, transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.cardinalMark, { right: size * 0.05, transform: [{ rotate: '90deg' }] }]} />
        </LinearGradient>
      </Animated.View>

      {/* Outer ring */}
      <View style={[styles.ring, { width: size * 1.1, height: size * 1.1 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: Colors.primary['100'],
    opacity: 0.3,
  },
  compass: {
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.primary['500'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  compassGradient: {
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: Colors.primary['300'],
    opacity: 0.5,
  },
  needle: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
  },
  needleNorth: {
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ef4444',
  },
  needleSouth: {
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
  },
  needleArrow: {
    width: 12,
    height: 25,
  },
  needleArrowSouth: {
    marginTop: -25,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardinalMark: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default CompassLoader;
