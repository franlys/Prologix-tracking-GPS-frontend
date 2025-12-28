import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors, BorderRadius, Shadows, Typography } from '../../constants/Theme';

interface CustomMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description?: string;
  status: 'online' | 'offline';
  icon?: string;
  speed?: number;
  onPress?: () => void;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  title,
  description,
  status,
  icon = '🚗',
  speed,
  onPress,
}) => {
  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={false} // Performance optimization
    >
      <View style={styles.container}>
        {/* Speed indicator if moving */}
        {speed !== undefined && speed > 0 && (
          <View style={styles.speedBadge}>
            <Text style={styles.speedText}>{Math.round(speed)} km/h</Text>
          </View>
        )}

        {/* Main marker */}
        <View style={[styles.marker, status === 'online' ? styles.online : styles.offline]}>
          <Text style={styles.icon}>{icon}</Text>

          {/* Status indicator dot */}
          <View style={[styles.statusDot, status === 'online' ? styles.dotOnline : styles.dotOffline]} />
        </View>

        {/* Marker shadow */}
        <View style={styles.shadow} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  speedBadge: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
    ...Shadows.sm,
  },
  speedText: {
    color: '#ffffff',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  marker: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    backgroundColor: '#ffffff',
    ...Shadows.lg,
  },
  online: {
    borderColor: Colors.success,
  },
  offline: {
    borderColor: Colors.light.textTertiary,
  },
  icon: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  dotOnline: {
    backgroundColor: Colors.success,
  },
  dotOffline: {
    backgroundColor: Colors.light.textTertiary,
  },
  shadow: {
    width: 30,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
});

export default CustomMarker;
