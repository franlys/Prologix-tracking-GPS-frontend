import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SMS from 'expo-sms';
import api from '../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/Theme';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface DeviceDetails {
  id: string;
  name: string;
  imei: string;
  phone?: string;
  online: boolean;
  lastUpdate: string;
  position?: {
    latitude: number;
    longitude: number;
    speed: number;
    altitude: number;
    course: number;
    address?: string;
  };
  attributes?: any;
}

const SMS_COMMANDS = [
  {
    id: 'locate',
    name: 'Ubicación',
    icon: 'location' as const,
    description: 'Solicitar ubicación actual',
    command: 'WHERE',
    color: '#3b82f6',
  },
  {
    id: 'status',
    name: 'Estado',
    icon: 'information-circle' as const,
    description: 'Consultar estado del GPS',
    command: 'STATUS',
    color: '#10b981',
  },
  {
    id: 'reboot',
    name: 'Reiniciar',
    icon: 'reload' as const,
    description: 'Reiniciar dispositivo',
    command: 'RESET',
    color: '#f59e0b',
  },
  {
    id: 'sos',
    name: 'SOS',
    icon: 'alert-circle' as const,
    description: 'Activar alarma SOS',
    command: 'SOS',
    color: '#ef4444',
  },
];

export default function DeviceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<DeviceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customCommand, setCustomCommand] = useState('');

  useEffect(() => {
    if (deviceId) {
      fetchDeviceDetails();
    }
  }, [deviceId]);

  const fetchDeviceDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/devices/${deviceId}`);
      setDevice(response.data);
    } catch (error) {
      console.error('Error fetching device details:', error);
      showAlert('Error', 'No se pudo cargar la información del dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeviceDetails();
    setRefreshing(false);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const sendSMSCommand = async (command: string, commandName: string) => {
    if (!device?.phone) {
      showAlert(
        'Teléfono no disponible',
        'Este dispositivo no tiene un número de teléfono registrado. Contacta al administrador.'
      );
      return;
    }

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        showAlert(
          'SMS no disponible',
          'Tu dispositivo no puede enviar SMS. ¿Deseas abrir la app de mensajes?'
        );

        if (Platform.OS !== 'web') {
          const smsUrl = `sms:${device.phone}?body=${encodeURIComponent(command)}`;
          Linking.openURL(smsUrl);
        }
        return;
      }

      const { result } = await SMS.sendSMSAsync(
        [device.phone],
        command
      );

      if (result === 'sent') {
        showAlert(
          'Comando enviado',
          `Se envió el comando "${commandName}" al dispositivo`
        );
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      showAlert('Error', 'No se pudo enviar el SMS');
    }
  };

  const sendCustomCommand = () => {
    if (!customCommand.trim()) {
      showAlert('Error', 'Ingresa un comando válido');
      return;
    }

    sendSMSCommand(customCommand, 'Personalizado');
    setCustomCommand('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const abs = Math.abs(coord);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(4);
    const dir = type === 'lat'
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${deg}° ${min}' ${dir}`;
  };

  if (loading || !device) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del GPS</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{device.name}</Text>
          <Badge
            label={device.online ? 'Online' : 'Offline'}
            variant={device.online ? 'success' : 'neutral'}
            size="sm"
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Device Info Card */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Información del Dispositivo</Text>

          <View style={styles.infoRow}>
            <Ionicons name="hardware-chip" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>IMEI</Text>
              <Text style={styles.infoValue}>{device.imei}</Text>
            </View>
          </View>

          {device.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{device.phone}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Última actualización</Text>
              <Text style={styles.infoValue}>{formatDate(device.lastUpdate)}</Text>
            </View>
          </View>
        </Card>

        {/* Position Card */}
        {device.position && (
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.sectionTitle}>Ubicación Actual</Text>

            {device.position.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#10b981" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{device.position.address}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="navigate" size={20} color="#3b82f6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Coordenadas</Text>
                <Text style={styles.infoValue}>
                  {formatCoordinate(device.position.latitude, 'lat')}
                  {'\n'}
                  {formatCoordinate(device.position.longitude, 'lng')}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="speedometer" size={24} color="#3b82f6" />
                <Text style={styles.statValue}>{Math.round(device.position.speed)}</Text>
                <Text style={styles.statLabel}>km/h</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="compass" size={24} color="#10b981" />
                <Text style={styles.statValue}>{Math.round(device.position.course)}°</Text>
                <Text style={styles.statLabel}>Rumbo</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="trending-up" size={24} color="#f59e0b" />
                <Text style={styles.statValue}>{Math.round(device.position.altitude)}</Text>
                <Text style={styles.statLabel}>m.s.n.m</Text>
              </View>
            </View>

            <Button
              title="Ver en el Mapa"
              onPress={() => router.push(`/(tabs)/map?deviceId=${device.id}`)}
              variant="primary"
              icon="map"
              style={styles.mapButton}
            />
          </Card>
        )}

        {/* SMS Commands Card */}
        {device.phone && (
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.sectionTitle}>Comandos SMS</Text>
            <Text style={styles.sectionSubtitle}>
              Envía comandos directamente al GPS por SMS
            </Text>

            <View style={styles.commandsGrid}>
              {SMS_COMMANDS.map((cmd) => (
                <TouchableOpacity
                  key={cmd.id}
                  style={[styles.commandButton, { borderColor: cmd.color }]}
                  onPress={() => sendSMSCommand(cmd.command, cmd.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={cmd.icon} size={24} color={cmd.color} />
                  <Text style={styles.commandName}>{cmd.name}</Text>
                  <Text style={styles.commandDesc}>{cmd.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Command */}
            <View style={styles.customCommandSection}>
              <Text style={styles.customCommandLabel}>Comando personalizado:</Text>
              <View style={styles.customCommandRow}>
                <TextInput
                  style={styles.customCommandInput}
                  value={customCommand}
                  onChangeText={setCustomCommand}
                  placeholder="Ej: WHERE, STATUS, RESET..."
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={sendCustomCommand}
                >
                  <Ionicons name="send" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'web' ? Spacing.base : Spacing.xxxl,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: '#6b7280',
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: Spacing.sm,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  infoLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#9ca3af',
    marginBottom: Spacing.xs / 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    color: '#1f2937',
    fontWeight: Typography.fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#f9fafb',
    borderRadius: BorderRadius.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#6b7280',
    marginTop: Spacing.xs / 2,
  },
  mapButton: {
    marginTop: Spacing.md,
  },
  commandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  commandButton: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  commandName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
    marginTop: Spacing.sm,
  },
  commandDesc: {
    fontSize: Typography.fontSize.xs,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: Spacing.xs / 2,
  },
  customCommandSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  customCommandLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
    marginBottom: Spacing.sm,
  },
  customCommandRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  customCommandInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
