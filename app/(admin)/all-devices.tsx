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
  user?: {
    name: string;
    email: string;
  };
}

export default function AllDevicesScreen() {
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
      const response = await api.get('/admin/devices');
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
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <Card variant="elevated" style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceIcon}>
          <Ionicons
            name={item.online ? 'car' : 'car-outline'}
            size={24}
            color={item.online ? '#10b981' : '#6b7280'}
          />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceImei}>IMEI: {item.imei}</Text>
          {item.user && (
            <View style={styles.userRow}>
              <Ionicons name="person-outline" size={14} color="#6b7280" />
              <Text style={styles.userName}>{item.user.name}</Text>
            </View>
          )}
        </View>
        <Badge
          label={item.online ? 'Online' : 'Offline'}
          variant={item.online ? 'success' : 'neutral'}
          size="sm"
        />
      </View>

      {item.lastUpdate && (
        <View style={styles.deviceFooter}>
          <Ionicons name="time-outline" size={14} color="#9ca3af" />
          <Text style={styles.lastUpdate}>
            Última actualización: {formatDate(item.lastUpdate)}
          </Text>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Todos los GPS</Text>
            <Text style={styles.headerSubtitle}>
              {devices.length} dispositivo{devices.length !== 1 ? 's' : ''} en el sistema
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              {devices.filter((d) => d.online).length}
            </Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
            <Text style={[styles.statValue, { color: '#6b7280' }]}>
              {devices.filter((d) => !d.online).length}
            </Text>
            <Text style={styles.statLabel}>Offline</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Ionicons name="person" size={20} color="#3b82f6" />
            <Text style={[styles.statValue, { color: '#3b82f6' }]}>
              {devices.filter((d) => d.user).length}
            </Text>
            <Text style={styles.statLabel}>Asignados</Text>
          </View>
        </View>
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
              <Text style={styles.emptyText}>No hay dispositivos GPS</Text>
              <Text style={styles.emptySubtext}>
                Los dispositivos configurados aparecerán aquí
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
    paddingTop: Platform.OS === 'web' ? Spacing.base : Spacing.xxxl,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginVertical: Spacing.xs / 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#6b7280',
  },
  divider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: Spacing.md,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  deviceCard: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  deviceImei: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginBottom: Spacing.xs / 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  userName: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
  },
  deviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: Spacing.xs,
  },
  lastUpdate: {
    fontSize: Typography.fontSize.xs,
    color: '#9ca3af',
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
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
  },
});
