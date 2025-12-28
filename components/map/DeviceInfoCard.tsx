import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../constants/Theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DeviceInfoCardProps {
  device: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    speed?: number;
    status: 'online' | 'offline';
    timestamp?: string;
    address?: string;
  };
  onClose: () => void;
  onViewDetails?: () => void;
}

export const DeviceInfoCard: React.FC<DeviceInfoCardProps> = ({
  device,
  onClose,
  onViewDetails,
}) => {
  const openNavigation = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${device.lat},${device.lng}`,
      android: `geo:0,0?q=${device.lat},${device.lng}(${encodeURIComponent(device.name)})`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${device.lat},${device.lng}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const shareLocation = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${device.lat},${device.lng}`;
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    } else {
      Linking.openURL(`sms:?body=Te comparto la ubicación de ${device.name}: ${url}`);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutDown.duration(200)}
      style={styles.container}
    >
      <LinearGradient
        colors={device.status === 'online' ? ['#10b981', '#06b6d4'] : ['#6b7280', '#4b5563']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Badge
              label={device.status === 'online' ? 'En línea' : 'Fuera de línea'}
              variant={device.status === 'online' ? 'success' : 'neutral'}
              size="sm"
            />
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          {device.speed !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⚡</Text>
              <Text style={styles.infoText}>{Math.round(device.speed)} km/h</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText} numberOfLines={1}>
              {device.address || `${device.lat.toFixed(4)}°, ${device.lng.toFixed(4)}°`}
            </Text>
          </View>

          {device.timestamp && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoText}>
                {new Date(device.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Navegar"
            onPress={openNavigation}
            variant="secondary"
            size="sm"
            icon={<Text>🧭</Text>}
            style={styles.actionButton}
          />
          <Button
            title="Compartir"
            onPress={shareLocation}
            variant="secondary"
            size="sm"
            icon={<Text>📤</Text>}
            style={styles.actionButton}
          />
          {onViewDetails && (
            <Button
              title="Detalles"
              onPress={onViewDetails}
              variant="outline"
              size="sm"
              style={styles.actionButton}
            />
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? Spacing.xl : Spacing.xxl,
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 1000,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    ...Shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  deviceName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: Typography.fontWeight.bold,
  },
  info: {
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

export default DeviceInfoCard;
