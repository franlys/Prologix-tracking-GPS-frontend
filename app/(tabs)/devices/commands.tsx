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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../../constants/Theme';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface Device {
  id: string;
  name: string;
  imei: string;
  phoneNumber?: string;
  model?: string;
}

interface SMSCommand {
  id: string;
  name: string;
  description: string;
  command: string;
  category: 'tracking' | 'control' | 'config' | 'security';
  icon: keyof typeof Ionicons.glyphMap;
  requiresParams?: boolean;
  placeholder?: string;
}

// Comandos SMS comunes para dispositivos GPS (GT06, TK103, etc.)
const SMS_COMMANDS: SMSCommand[] = [
  // Rastreo y Ubicación
  {
    id: 'location',
    name: 'Obtener Ubicación',
    description: 'Solicita la ubicación actual del GPS',
    command: 'LOCATE#',
    category: 'tracking',
    icon: 'location',
  },
  {
    id: 'google-maps',
    name: 'Link Google Maps',
    description: 'Recibe un enlace de Google Maps con la ubicación',
    command: 'URL#',
    category: 'tracking',
    icon: 'map',
  },
  {
    id: 'check-status',
    name: 'Estado del GPS',
    description: 'Consulta batería, señal y configuración',
    command: 'STATUS#',
    category: 'tracking',
    icon: 'information-circle',
  },

  // Control del Vehículo
  {
    id: 'cut-engine',
    name: 'Cortar Motor',
    description: '⚠️ Detiene el motor del vehículo (solo si está detenido)',
    command: 'STOP#',
    category: 'control',
    icon: 'stop-circle',
  },
  {
    id: 'restore-engine',
    name: 'Restaurar Motor',
    description: 'Reactiva el motor del vehículo',
    command: 'RESUME#',
    category: 'control',
    icon: 'play-circle',
  },

  // Configuración
  {
    id: 'set-apn',
    name: 'Configurar APN',
    description: 'Configura el APN para conexión de datos',
    command: 'APN#',
    category: 'config',
    icon: 'cellular',
    requiresParams: true,
    placeholder: 'internet.telco.do',
  },
  {
    id: 'set-admin',
    name: 'Número Administrador',
    description: 'Establece el número de teléfono administrador',
    command: 'ADMIN#',
    category: 'config',
    icon: 'person',
    requiresParams: true,
    placeholder: '8091234567',
  },
  {
    id: 'set-timezone',
    name: 'Zona Horaria',
    description: 'Configura zona horaria (RD: GMT-4)',
    command: 'TIMEZONE#E#4#',
    category: 'config',
    icon: 'time',
  },

  // Seguridad
  {
    id: 'sos-number',
    name: 'Número SOS',
    description: 'Configura número de emergencia',
    command: 'SOS#',
    category: 'config',
    icon: 'warning',
    requiresParams: true,
    placeholder: '8091234567',
  },
  {
    id: 'reset',
    name: 'Resetear GPS',
    description: '⚠️ Restaura configuración de fábrica',
    command: 'FACTORY#',
    category: 'security',
    icon: 'refresh',
  },
  {
    id: 'reboot',
    name: 'Reiniciar GPS',
    description: 'Reinicia el dispositivo GPS',
    command: 'RESET#',
    category: 'security',
    icon: 'power',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: 'apps' as const },
  { id: 'tracking', name: 'Rastreo', icon: 'location' as const },
  { id: 'control', name: 'Control', icon: 'settings' as const },
  { id: 'config', name: 'Config', icon: 'construct' as const },
  { id: 'security', name: 'Seguridad', icon: 'shield' as const },
];

export default function DeviceCommandsScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customCommand, setCustomCommand] = useState('');
  const [commandParams, setCommandParams] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
      if (response.data.length > 0 && !selectedDevice) {
        setSelectedDevice(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const sendSMSCommand = async (command: SMSCommand, params?: string) => {
    if (!selectedDevice) {
      showAlert('Error', 'Por favor selecciona un dispositivo primero');
      return;
    }

    if (!selectedDevice.phoneNumber) {
      showAlert('Error', 'Este dispositivo no tiene número de teléfono configurado');
      return;
    }

    let finalCommand = command.command;
    if (params) {
      finalCommand = `${command.command}${params}#`;
    }

    Alert.alert(
      'Confirmar Comando',
      `¿Enviar "${finalCommand}" a ${selectedDevice.name}?\n\nNúmero: ${selectedDevice.phoneNumber}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              setLoading(true);
              // Aquí podrías integrar con un servicio de SMS o enviar por la API
              await api.post(`/devices/${selectedDevice.id}/sms`, {
                command: finalCommand,
              });
              showAlert(
                '✓ Comando Enviado',
                `El comando ha sido enviado a ${selectedDevice.name}\n\nRecibirás una respuesta por SMS.`
              );
              setCommandParams({});
            } catch (error: any) {
              console.error('Error sending SMS:', error);
              showAlert(
                'Error',
                error.response?.data?.message || 'No se pudo enviar el comando SMS'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const sendCustomCommand = () => {
    if (!customCommand.trim()) {
      showAlert('Error', 'Ingresa un comando SMS');
      return;
    }

    sendSMSCommand({
      id: 'custom',
      name: 'Comando Personalizado',
      description: customCommand,
      command: customCommand,
      category: 'config',
      icon: 'code',
    });
  };

  const getFilteredCommands = () => {
    if (selectedCategory === 'all') {
      return SMS_COMMANDS;
    }
    return SMS_COMMANDS.filter((cmd) => cmd.category === selectedCategory);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tracking':
        return '#3b82f6';
      case 'control':
        return '#f59e0b';
      case 'config':
        return '#8b5cf6';
      case 'security':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#60a5fa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Comandos SMS</Text>
          <Text style={styles.headerSubtitle}>Controla tu GPS remotamente</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubbles" size={24} color="#ffffff" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Device Selector */}
        <Card variant="elevated" style={styles.deviceCard}>
          <Text style={styles.sectionTitle}>Dispositivo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.devicesScroll}>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={[
                  styles.deviceChip,
                  selectedDevice?.id === device.id && styles.deviceChipActive,
                ]}
                onPress={() => setSelectedDevice(device)}
              >
                <Ionicons
                  name="hardware-chip"
                  size={16}
                  color={selectedDevice?.id === device.id ? '#3b82f6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.deviceChipText,
                    selectedDevice?.id === device.id && styles.deviceChipTextActive,
                  ]}
                >
                  {device.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={selectedCategory === category.id ? '#3b82f6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Commands List */}
        <View style={styles.commandsContainer}>
          <Text style={styles.resultsCount}>
            {getFilteredCommands().length} comando{getFilteredCommands().length !== 1 ? 's' : ''}
          </Text>

          {getFilteredCommands().map((command) => (
            <Card key={command.id} variant="outlined" style={styles.commandCard}>
              <View style={styles.commandHeader}>
                <View
                  style={[
                    styles.commandIcon,
                    { backgroundColor: `${getCategoryColor(command.category)}15` },
                  ]}
                >
                  <Ionicons
                    name={command.icon}
                    size={24}
                    color={getCategoryColor(command.category)}
                  />
                </View>
                <View style={styles.commandInfo}>
                  <Text style={styles.commandName}>{command.name}</Text>
                  <Text style={styles.commandDescription}>{command.description}</Text>
                  <View style={styles.commandCodeContainer}>
                    <Ionicons name="code-slash" size={12} color="#6b7280" />
                    <Text style={styles.commandCode}>{command.command}</Text>
                  </View>
                </View>
              </View>

              {command.requiresParams && (
                <TextInput
                  style={styles.paramInput}
                  placeholder={command.placeholder || 'Parámetro'}
                  value={commandParams[command.id] || ''}
                  onChangeText={(text) =>
                    setCommandParams({ ...commandParams, [command.id]: text })
                  }
                  placeholderTextColor="#9ca3af"
                />
              )}

              <Button
                title="Enviar Comando"
                onPress={() => sendSMSCommand(command, commandParams[command.id])}
                variant="solid"
                size="md"
                fullWidth
                loading={loading}
                style={styles.sendButton}
              />
            </Card>
          ))}
        </View>

        {/* Custom Command */}
        <Card variant="elevated" style={styles.customCommandCard}>
          <View style={styles.customCommandHeader}>
            <Ionicons name="terminal" size={20} color="#8b5cf6" />
            <Text style={styles.customCommandTitle}>Comando Personalizado</Text>
          </View>
          <TextInput
            style={styles.customInput}
            placeholder="Ej: PASSWORD,123456,PASSWORD,654321#"
            value={customCommand}
            onChangeText={setCustomCommand}
            placeholderTextColor="#9ca3af"
            multiline
          />
          <Button
            title="Enviar Comando Custom"
            onPress={sendCustomCommand}
            variant="gradient"
            size="md"
            fullWidth
            loading={loading}
          />
        </Card>

        {/* Warning Note */}
        <Card variant="outlined" style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.warningTitle}>Importante</Text>
          </View>
          <Text style={styles.warningText}>
            • Los comandos SMS varían según el modelo del GPS{'\n'}
            • Cortar motor solo funciona con el vehículo detenido{'\n'}
            • Guarda el número del GPS en tus contactos{'\n'}
            • Algunos comandos requieren contraseña (default: 123456){'\n'}
            • Verifica el manual de tu dispositivo GPS
          </Text>
        </Card>

        <View style={{ height: 40 }} />
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
    paddingTop: Platform.OS === 'web' ? Spacing.lg : Spacing.xxxl,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  deviceCard: {
    margin: Spacing.base,
    padding: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#374151',
    marginBottom: Spacing.sm,
  },
  devicesScroll: {
    flexDirection: 'row',
  },
  deviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#f3f4f6',
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  deviceChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  deviceChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#6b7280',
  },
  deviceChipTextActive: {
    color: '#3b82f6',
  },
  filterContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#f3f4f6',
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#3b82f6',
  },
  commandsContainer: {
    paddingHorizontal: Spacing.base,
  },
  resultsCount: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginBottom: Spacing.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  commandCard: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  commandHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  commandIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  commandInfo: {
    flex: 1,
  },
  commandName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  commandDescription: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginBottom: Spacing.xs,
  },
  commandCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  commandCode: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  paramInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: '#1f2937',
    marginBottom: Spacing.md,
  },
  sendButton: {
    marginTop: 0,
  },
  customCommandCard: {
    margin: Spacing.base,
    padding: Spacing.base,
  },
  customCommandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  customCommandTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#8b5cf6',
  },
  customInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: '#1f2937',
    marginBottom: Spacing.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  warningCard: {
    margin: Spacing.base,
    padding: Spacing.base,
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  warningTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#f59e0b',
  },
  warningText: {
    fontSize: Typography.fontSize.sm,
    color: '#92400e',
    lineHeight: 20,
  },
});
