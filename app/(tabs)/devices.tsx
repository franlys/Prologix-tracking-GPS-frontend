import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface Device {
  id: string;
  name: string;
  imei: string;
  online: boolean;
  lastUpdate: string;
  position?: {
    latitude: number;
    longitude: number;
    speed: number;
    address?: string;
  };
}

export default function DevicesScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} hrs`;
    return `Hace ${Math.floor(diffMins / 1440)} días`;
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/device-details?id=${item.id}`)}
    >
      <Card variant="elevated" style={styles.deviceCard}>
        <View style={styles.deviceHeader}>
          <View
            style={[
              styles.deviceIcon,
              { backgroundColor: item.online ? '#ecfdf5' : '#f3f4f6' },
            ]}
          >
            <Ionicons
              name={item.online ? 'car' : 'car-outline'}
              size={28}
              color={item.online ? '#10b981' : '#6b7280'}
            />
          </View>

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <View style={styles.deviceMeta}>
              <Ionicons name="hardware-chip-outline" size={14} color="#9ca3af" />
              <Text style={styles.deviceImei}>{item.imei}</Text>
            </View>
            {item.position?.address && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.position.address}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.deviceStatus}>
            <Badge
              label={item.online ? 'Online' : 'Offline'}
              variant={item.online ? 'success' : 'neutral'}
              size="sm"
            />
            {item.position && (
              <View style={styles.speedContainer}>
                <Ionicons name="speedometer-outline" size={14} color="#3b82f6" />
                <Text style={styles.speedText}>
                  {Math.round(item.position.speed)} km/h
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.deviceFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color="#9ca3af" />
            <Text style={styles.footerText}>
              {item.lastUpdate ? formatDate(item.lastUpdate) : 'Sin datos'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => router.push(`/device-details?id=${item.id}`)}
          >
            <Text style={styles.detailsButtonText}>Ver detalles</Text>
            <Ionicons name="chevron-forward" size={16} color="#7c3aed" />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Dispositivos</Text>
        <Text style={styles.headerSubtitle}>
          {devices.length} dispositivo{devices.length !== 1 ? 's' : ''} GPS
        </Text>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons name="car-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyText}>No tienes dispositivos GPS</Text>
              <Text style={styles.emptySubtext}>
                Contacta al administrador para vincular un dispositivo a tu cuenta
              </Text>
            </Card>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'web' ? Spacing.lg : Spacing.xxxl,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 20,
  },
  deviceCard: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  deviceHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  deviceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    marginBottom: Spacing.xs / 2,
  },
  deviceImei: {
    fontSize: Typography.fontSize.sm,
    color: '#9ca3af',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    maxWidth: '90%',
  },
  locationText: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    flex: 1,
  },
  deviceStatus: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    marginTop: Spacing.xs,
  },
  speedText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#3b82f6',
  },
  deviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: '#9ca3af',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  detailsButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#7c3aed',
  },
  emptyCard: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
