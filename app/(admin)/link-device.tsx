import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface User {
  id: string;
  name: string;
  email: string;
  traccarUserId?: number;
}

interface TraccarDevice {
  id: number;
  name: string;
  uniqueId: string;
  status: string;
  lastUpdate: string;
}

export default function LinkDeviceScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<TraccarDevice[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<TraccarDevice | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [searchDevice, setSearchDevice] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchDevices();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices/all');
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleLinkDevice = async () => {
    if (!selectedUser || !selectedDevice) {
      showAlert('Error', 'Selecciona un usuario y un dispositivo');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/link-device', {
        userId: selectedUser.id,
        deviceId: selectedDevice.id,
      });

      showAlert('¡Éxito!', `Dispositivo "${selectedDevice.name}" vinculado a ${selectedUser.name}`);

      setSelectedUser(null);
      setSelectedDevice(null);
      fetchUsers();
      fetchDevices();
    } catch (error: any) {
      console.error('Error:', error);
      showAlert('Error', error.response?.data?.message || 'No se pudo vincular el dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchDevice.toLowerCase()) ||
      device.uniqueId.includes(searchDevice)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vincular Dispositivo GPS</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          Asignar dispositivo a un cliente
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Selección de Usuario */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>1. Seleccionar Cliente</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o email..."
            value={searchUser}
            onChangeText={setSearchUser}
          />

          {selectedUser ? (
            <View style={styles.selectedBox}>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedUser.name}</Text>
                <Text style={styles.selectedEmail}>{selectedUser.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.userList}>
              {filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userItem}
                  onPress={() => setSelectedUser(user)}
                >
                  <View style={styles.userIcon}>
                    <Text style={styles.userIconText}>👤</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.traccarUserId && (
                      <Badge label="Traccar configurado" variant="success" size="sm" />
                    )}
                  </View>
                  <Text style={styles.selectArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Selección de Dispositivo */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>2. Seleccionar Dispositivo GPS</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o IMEI..."
            value={searchDevice}
            onChangeText={setSearchDevice}
          />

          {selectedDevice ? (
            <View style={styles.selectedBox}>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedDevice.name}</Text>
                <Text style={styles.selectedEmail}>IMEI: {selectedDevice.uniqueId}</Text>
                <Badge
                  label={selectedDevice.status === 'online' ? 'Online' : 'Offline'}
                  variant={selectedDevice.status === 'online' ? 'success' : 'neutral'}
                  size="sm"
                />
              </View>
              <TouchableOpacity onPress={() => setSelectedDevice(null)}>
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.deviceList}>
              {filteredDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceItem}
                  onPress={() => setSelectedDevice(device)}
                >
                  <View style={styles.deviceIcon}>
                    <Text style={styles.deviceIconText}>🚗</Text>
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceImei}>IMEI: {device.uniqueId}</Text>
                    <View style={styles.deviceMeta}>
                      <Badge
                        label={device.status === 'online' ? 'Online' : 'Offline'}
                        variant={device.status === 'online' ? 'success' : 'neutral'}
                        size="sm"
                      />
                    </View>
                  </View>
                  <Text style={styles.selectArrow}>›</Text>
                </TouchableOpacity>
              ))}

              {filteredDevices.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>No hay dispositivos disponibles</Text>
                  <Button
                    title="+ Configurar Nuevo GPS"
                    onPress={() => router.push('/(admin)/device-setup')}
                    variant="outline"
                    size="sm"
                  />
                </View>
              )}
            </View>
          )}
        </Card>

        {/* Botón de Vinculación */}
        {selectedUser && selectedDevice && (
          <Card variant="elevated" style={styles.card}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumen:</Text>
              <Text style={styles.summaryText}>
                📱 GPS: <Text style={styles.summaryBold}>{selectedDevice.name}</Text>
              </Text>
              <Text style={styles.summaryText}>
                👤 Cliente: <Text style={styles.summaryBold}>{selectedUser.name}</Text>
              </Text>
            </View>

            <Button
              title="Vincular Dispositivo"
              onPress={handleLinkDevice}
              loading={loading}
              variant="gradient"
              gradient={['#10b981', '#059669']}
              size="lg"
              fullWidth
            />
          </Card>
        )}

        {/* Ayuda */}
        <Card variant="outlined" style={[styles.card, styles.helpCard]}>
          <Text style={styles.helpTitle}>💡 Nota</Text>
          <Text style={styles.helpText}>
            Una vez vinculado, el cliente podrá ver este dispositivo en su app móvil y rastrearlo en tiempo real.
          </Text>
        </Card>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
  },
  headerSpacer: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    paddingHorizontal: Spacing.base,
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  card: {
    marginBottom: Spacing.base,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.base,
  },
  searchInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.base,
  },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.success['500'],
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  selectedEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  clearButton: {
    fontSize: 24,
    color: Colors.light.textTertiary,
    padding: Spacing.sm,
  },
  userList: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userIconText: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  selectArrow: {
    fontSize: 24,
    color: Colors.light.textTertiary,
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  deviceIconText: {
    fontSize: 20,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  deviceImei: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.base,
  },
  summaryBox: {
    backgroundColor: Colors.light.background,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  summaryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryBold: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  helpCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  helpTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#065f46',
    marginBottom: Spacing.sm,
  },
  helpText: {
    fontSize: Typography.fontSize.sm,
    color: '#064e3b',
    lineHeight: 20,
  },
});
