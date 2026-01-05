import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface GPSModel {
  id: string;
  name: string;
  protocol: string;
  port: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GPS_MODELS: GPSModel[] = [
  // TKSTAR - Modelos más populares
  {
    id: 'tk905',
    name: 'TKSTAR TK905',
    protocol: 'GT06',
    port: 5023,
    description: 'Imán - Batería larga duración',
    icon: 'magnet',
  },
  {
    id: 'tk915',
    name: 'TKSTAR TK915',
    protocol: 'GT06',
    port: 5023,
    description: '4G - Batería 10,000mAh',
    icon: 'battery-charging',
  },
  {
    id: 'tk806',
    name: 'TKSTAR TK806',
    protocol: 'GT06',
    port: 5023,
    description: 'Relay corta corriente',
    icon: 'flash',
  },
  {
    id: 'tk909',
    name: 'TKSTAR TK909',
    protocol: 'GT06',
    port: 5023,
    description: 'Vehículos - Instalación cableada',
    icon: 'car-sport',
  },
  {
    id: 'tk103',
    name: 'TKSTAR TK103',
    protocol: 'TK103',
    port: 5013,
    description: 'Económico - Relay corta corriente',
    icon: 'car',
  },
  {
    id: 'tk935',
    name: 'TKSTAR TK935',
    protocol: 'GT06',
    port: 5023,
    description: '4G - Modelo 2025',
    icon: 'hardware-chip',
  },
  {
    id: 'tks1',
    name: 'TKSTAR TKS1',
    protocol: 'GT06',
    port: 5023,
    description: 'Mini - Portátil',
    icon: 'cube',
  },
  {
    id: 'tk901',
    name: 'TKSTAR TK901',
    protocol: 'GT06',
    port: 5023,
    description: 'Personal - Mascotas',
    icon: 'paw',
  },
  {
    id: 'tk913',
    name: 'TKSTAR TK913',
    protocol: 'GT06',
    port: 5023,
    description: 'Vehículos pesados',
    icon: 'bus',
  },
  {
    id: 'tk905b',
    name: 'TKSTAR TK905B',
    protocol: 'GT06',
    port: 5023,
    description: 'Versión mejorada TK905',
    icon: 'magnet',
  },
  {
    id: 'jtk905-4g',
    name: 'TKSTAR JTK905-4G',
    protocol: 'GT06',
    port: 5023,
    description: '4G - Imán fuerte',
    icon: 'magnet',
  },
  {
    id: 'tk818',
    name: 'TKSTAR TK818',
    protocol: 'GT06',
    port: 5023,
    description: 'Auto - Micrófono',
    icon: 'mic',
  },
  {
    id: 'tk911pro',
    name: 'TKSTAR TK911PRO',
    protocol: 'GT06',
    port: 5023,
    description: 'Profesional - Multi sensor',
    icon: 'business',
  },
  {
    id: 'tk919',
    name: 'TKSTAR TK919',
    protocol: 'GT06',
    port: 5023,
    description: 'Vehículos - Cable OBD',
    icon: 'construct',
  },
  {
    id: 'tk918',
    name: 'TKSTAR TK918',
    protocol: 'GT06',
    port: 5023,
    description: 'Portátil - Botón SOS',
    icon: 'alert-circle',
  },
  {
    id: 'tk905mini',
    name: 'TKSTAR TK905MINI',
    protocol: 'GT06',
    port: 5023,
    description: 'Mini - Ultra compacto',
    icon: 'cube-outline',
  },
  {
    id: 'tks2',
    name: 'TKSTAR TKS2',
    protocol: 'GT06',
    port: 5023,
    description: 'Personal - Resistente al agua',
    icon: 'water',
  },
  {
    id: 'tk720',
    name: 'TKSTAR TK720',
    protocol: 'GT06',
    port: 5023,
    description: 'Auto - Audio bidireccional',
    icon: 'headset',
  },

  // CONCOX - Popular en República Dominicana
  {
    id: 'gt06n',
    name: 'Concox GT06N',
    protocol: 'GT06',
    port: 5023,
    description: 'Popular en RD - SMS + GPRS',
    icon: 'hardware-chip',
  },
  {
    id: 'gt06e',
    name: 'Concox GT06E',
    protocol: 'GT06',
    port: 5023,
    description: '4G LTE - Moderno',
    icon: 'cellular',
  },
  {
    id: 'gv500',
    name: 'Concox GV500',
    protocol: 'GT06',
    port: 5023,
    description: 'Flotas - Multi función',
    icon: 'apps',
  },

  // COBAN
  {
    id: 'tk103b',
    name: 'Coban TK103B',
    protocol: 'TK103',
    port: 5013,
    description: 'Mejorado - Relay + Micrófono',
    icon: 'car-sport',
  },
  {
    id: 'gps303',
    name: 'Coban GPS303',
    protocol: 'GPS103',
    port: 5001,
    description: 'Clásico - Muy usado en RD',
    icon: 'navigate',
  },
  {
    id: 'tk303',
    name: 'Coban TK303',
    protocol: 'TK103',
    port: 5013,
    description: 'Económico - Básico',
    icon: 'location',
  },

  // TELTONIKA - Profesional
  {
    id: 'fmb120',
    name: 'Teltonika FMB120',
    protocol: 'Teltonika',
    port: 5027,
    description: 'Profesional - CAN bus',
    icon: 'business',
  },
  {
    id: 'fmb920',
    name: 'Teltonika FMB920',
    protocol: 'Teltonika',
    port: 5027,
    description: 'Profesional - GNSS + BT',
    icon: 'business',
  },
  {
    id: 'fmb640',
    name: 'Teltonika FMB640',
    protocol: 'Teltonika',
    port: 5027,
    description: 'Avanzado - Dual SIM',
    icon: 'shield-checkmark',
  },

  // QUECLINK
  {
    id: 'gl300',
    name: 'Queclink GL300',
    protocol: 'GL200',
    port: 5025,
    description: 'Personal - Batería larga',
    icon: 'person',
  },
  {
    id: 'gv500',
    name: 'Queclink GV500',
    protocol: 'GL200',
    port: 5025,
    description: 'Vehículos - 3G/4G',
    icon: 'car',
  },
  {
    id: 'gl520',
    name: 'Queclink GL520',
    protocol: 'GL200',
    port: 5025,
    description: 'Assets - Contenedores',
    icon: 'cube',
  },

  // OTROS POPULARES
  {
    id: 'st901',
    name: 'Suntech ST901',
    protocol: 'ST210',
    port: 5011,
    description: 'Flotas - Confiable',
    icon: 'speedometer',
  },
  {
    id: 'h02',
    name: 'H02 Genérico',
    protocol: 'H02',
    port: 5013,
    description: 'Básico - Compatible muchas marcas',
    icon: 'location',
  },
  {
    id: 'pt502',
    name: 'Xexun PT502',
    protocol: 'PT502',
    port: 5001,
    description: 'Personal - Portátil',
    icon: 'walk',
  },
  {
    id: 'gt02',
    name: 'GT02 Generic',
    protocol: 'GT06',
    port: 5023,
    description: 'Genérico - Multi marca',
    icon: 'hardware-chip',
  },
  {
    id: 'a8',
    name: 'Mini A8',
    protocol: 'GT06',
    port: 5023,
    description: 'Mini - Espionaje/Personal',
    icon: 'eye',
  },
  {
    id: 'tr06',
    name: 'TR06',
    protocol: 'GT06',
    port: 5023,
    description: 'OBD II - Plug and play',
    icon: 'plug',
  },
];

export default function DeviceSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Device Info
  const [deviceName, setDeviceName] = useState('');
  const [imei, setImei] = useState('');
  const [selectedModel, setSelectedModel] = useState<GPSModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Step 2: SMS Commands (generated)
  const [smsCommands, setSmsCommands] = useState<
    { title: string; command: string; note: string }[]
  >([]);

  // Step 3: Connection Verification
  const [verifying, setVerifying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'checking' | 'connected' | 'failed'
  >('idle');

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleStep1Next = () => {
    if (!deviceName.trim()) {
      showAlert('Error', 'Ingresa el nombre del vehículo');
      return;
    }
    if (!imei.trim() || imei.length !== 15) {
      showAlert('Error', 'El IMEI debe tener 15 dígitos');
      return;
    }
    if (!selectedModel) {
      showAlert('Error', 'Selecciona un modelo de GPS');
      return;
    }

    const commands = generateSMSCommands();
    setSmsCommands(commands);
    setStep(2);
  };

  const generateSMSCommands = () => {
    if (!selectedModel) return [];

    const serverIP = process.env.EXPO_PUBLIC_TRACCAR_SERVER_IP || 'TU_IP_SERVIDOR';
    const port = selectedModel.port;

    return [
      {
        title: '1. Configurar APN',
        command: `APN,claro.com.do,claro,claro#`,
        note: 'Cambiar según tu operador (Claro, Altice, Viva)',
      },
      {
        title: '2. Configurar Servidor',
        command: `SERVER,1,${serverIP},${port},0#`,
        note: 'Dirección del servidor Traccar',
      },
      {
        title: '3. Intervalo de Envío',
        command: `TIMER,30#`,
        note: 'Enviar posición cada 30 segundos',
      },
      {
        title: '4. Reiniciar GPS',
        command: `RESET#`,
        note: 'Aplicar configuración',
      },
    ];
  };

  const copyToClipboard = (text: string) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text);
      showAlert('Copiado', 'Comando copiado al portapapeles');
    } else {
      showAlert('Copiar', `Copia este comando:\n\n${text}`);
    }
  };

  const handleVerifyConnection = async () => {
    setVerifying(true);
    setConnectionStatus('checking');

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const connected = Math.random() > 0.3;

      if (connected) {
        setConnectionStatus('connected');
        showAlert(
          'Conectado',
          `El GPS "${deviceName}" está enviando datos correctamente.`
        );
      } else {
        setConnectionStatus('failed');
        showAlert(
          'Sin Conexión',
          'El GPS aún no ha enviado datos. Verifica:\n\n1. Que enviaste todos los SMS\n2. Que el GPS tiene señal GSM\n3. Que la SIM tiene datos activos\n\nEspera 2-3 minutos e intenta de nuevo.'
        );
      }
    } catch (error) {
      setConnectionStatus('failed');
      showAlert('Error', 'No se pudo verificar la conexión');
    } finally {
      setVerifying(false);
    }
  };

  const handleFinish = () => {
    showAlert(
      'Configuración Completa',
      `GPS "${deviceName}" configurado exitosamente.\n\nAhora puedes vincularlo a un usuario desde el panel "Vincular Dispositivo".`
    );
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurar Dispositivo GPS</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
              {step > 1 ? (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              ) : (
                <Text style={[styles.stepNumber, step === 1 && styles.stepNumberActive]}>1</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>
              Información
            </Text>
          </View>

          <View style={[styles.stepLine, step > 1 && styles.stepLineActive]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
              {step > 2 ? (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              ) : (
                <Text style={[styles.stepNumber, step === 2 && styles.stepNumberActive]}>2</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>
              Comandos SMS
            </Text>
          </View>

          <View style={[styles.stepLine, step > 2 && styles.stepLineActive]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
              <Text style={[styles.stepNumber, step === 3 && styles.stepNumberActive]}>3</Text>
            </View>
            <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>
              Verificar
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Device Information */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Información del Dispositivo</Text>
            </View>

            <Text style={styles.label}>Nombre del Vehículo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="car-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Toyota Corolla 2020"
                value={deviceName}
                onChangeText={setDeviceName}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <Text style={styles.label}>IMEI del GPS (15 dígitos)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="123456789012345"
                value={imei}
                onChangeText={setImei}
                keyboardType="numeric"
                maxLength={15}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.hint}>
              <Ionicons name="bulb-outline" size={16} color="#6b7280" />
              <Text style={styles.hintText}>
                Envía "IMEI#" por SMS al GPS para obtenerlo
              </Text>
            </View>

            <Text style={styles.label}>Modelo del GPS</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por modelo, marca o protocolo..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {/* Results Count */}
            <Text style={styles.resultsCount}>
              {GPS_MODELS.filter((model) =>
                model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.description.toLowerCase().includes(searchQuery.toLowerCase())
              ).length} modelos encontrados
            </Text>

            {/* Model List - Scrollable */}
            <ScrollView
              style={styles.modelsScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {GPS_MODELS
                .filter((model) =>
                  model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  model.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  model.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((model) => (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelCard,
                      selectedModel?.id === model.id && styles.modelCardSelected,
                    ]}
                    onPress={() => setSelectedModel(model)}
                  >
                    <View style={styles.modelIcon}>
                      <Ionicons
                        name={model.icon}
                        size={24}
                        color={selectedModel?.id === model.id ? '#3b82f6' : '#6b7280'}
                      />
                    </View>
                    <View style={styles.modelInfo}>
                      <Text style={styles.modelName}>{model.name}</Text>
                      <Text style={styles.modelDescription}>{model.description}</Text>
                      <View style={styles.modelMeta}>
                        <Badge label={model.protocol} variant="neutral" size="sm" />
                        <Text style={styles.modelPort}>Puerto {model.port}</Text>
                      </View>
                    </View>
                    {selectedModel?.id === model.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                ))}

              {GPS_MODELS.filter((model) =>
                model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.description.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={48} color="#d1d5db" />
                  <Text style={styles.noResultsText}>No se encontraron modelos</Text>
                  <Text style={styles.noResultsSubtext}>
                    Intenta buscar por otra marca o modelo
                  </Text>
                </View>
              )}
            </ScrollView>

            <Button
              title="Continuar"
              onPress={handleStep1Next}
              variant="solid"
              size="lg"
              fullWidth
              style={styles.continueButton}
            />
          </View>
        )}

        {/* Step 2: SMS Commands */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="sms" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Comandos de Configuración</Text>
            </View>

            <Card variant="outlined" style={styles.instructionCard}>
              <View style={styles.instructionHeader}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={styles.instructionTitle}>Instrucciones</Text>
              </View>
              <Text style={styles.instructionText}>
                Envía cada comando por SMS al número del GPS en el orden mostrado.
                Espera confirmación "OK" antes del siguiente.
              </Text>
            </Card>

            {smsCommands.map((cmd, index) => (
              <Card key={index} variant="elevated" style={styles.commandCard}>
                <View style={styles.commandHeader}>
                  <Text style={styles.commandTitle}>{cmd.title}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(cmd.command)}
                  >
                    <Feather name="copy" size={16} color="#3b82f6" />
                    <Text style={styles.copyText}>Copiar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.commandCodeBox}>
                  <Text style={styles.commandCode}>{cmd.command}</Text>
                </View>
                <View style={styles.commandNote}>
                  <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
                  <Text style={styles.commandNoteText}>{cmd.note}</Text>
                </View>
              </Card>
            ))}

            <Button
              title="Continuar a Verificación"
              onPress={() => setStep(3)}
              variant="solid"
              size="lg"
              fullWidth
              style={styles.continueButton}
            />
          </View>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Verificar Conexión</Text>
            </View>

            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Ionicons name="car" size={20} color="#6b7280" />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Dispositivo</Text>
                  <Text style={styles.summaryValue}>{deviceName}</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="key" size={20} color="#6b7280" />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>IMEI</Text>
                  <Text style={styles.summaryValue}>{imei}</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="hardware-chip" size={20} color="#6b7280" />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Modelo</Text>
                  <Text style={styles.summaryValue}>{selectedModel?.name}</Text>
                </View>
              </View>
            </Card>

            {connectionStatus === 'idle' && (
              <Card variant="outlined" style={styles.statusCard}>
                <Ionicons name="time-outline" size={48} color="#f59e0b" />
                <Text style={styles.statusTitle}>Esperando Conexión</Text>
                <Text style={styles.statusText}>
                  Después de enviar todos los comandos SMS, espera 2-3 minutos
                  para que el GPS se conecte al servidor.
                </Text>
              </Card>
            )}

            {connectionStatus === 'checking' && (
              <Card variant="outlined" style={styles.statusCard}>
                <Ionicons name="sync" size={48} color="#3b82f6" />
                <Text style={styles.statusTitle}>Verificando...</Text>
                <Text style={styles.statusText}>
                  Consultando el servidor Traccar...
                </Text>
              </Card>
            )}

            {connectionStatus === 'connected' && (
              <Card variant="outlined" style={[styles.statusCard, styles.statusSuccess]}>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                <Text style={[styles.statusTitle, styles.statusSuccessText]}>
                  ¡Conectado Exitosamente!
                </Text>
                <Text style={styles.statusText}>
                  El GPS está enviando datos correctamente.{'\n'}
                  Última posición recibida hace 30 segundos.
                </Text>
              </Card>
            )}

            {connectionStatus === 'failed' && (
              <Card variant="outlined" style={[styles.statusCard, styles.statusError]}>
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <Text style={[styles.statusTitle, styles.statusErrorText]}>
                  Sin Conexión
                </Text>
                <Text style={styles.statusText}>
                  El GPS aún no ha enviado datos. Verifica que:{'\n\n'}
                  • Enviaste todos los comandos SMS{'\n'}
                  • El GPS tiene señal GSM (LED encendido){'\n'}
                  • La SIM tiene datos activos
                </Text>
              </Card>
            )}

            <Button
              title={verifying ? 'Verificando...' : 'Verificar Conexión'}
              onPress={handleVerifyConnection}
              loading={verifying}
              variant="outline"
              size="lg"
              fullWidth
              style={styles.verifyButton}
            />

            {connectionStatus === 'connected' && (
              <Button
                title="Finalizar Configuración"
                onPress={handleFinish}
                variant="solid"
                size="lg"
                fullWidth
                style={styles.finishButton}
              />
            )}
          </View>
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
    marginBottom: Spacing.lg,
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
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: '#3b82f6',
  },
  stepNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#9ca3af',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#6b7280',
  },
  stepLabelActive: {
    color: '#3b82f6',
    fontWeight: Typography.fontWeight.semibold,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: Spacing.xs,
  },
  stepLineActive: {
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginLeft: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#374151',
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: '#1f2937',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  hintText: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginLeft: Spacing.xs,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  modelCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  modelIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  modelDescription: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginBottom: Spacing.xs,
  },
  modelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modelPort: {
    fontSize: Typography.fontSize.xs,
    color: '#9ca3af',
  },
  instructionCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  instructionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1e40af',
    marginLeft: Spacing.sm,
  },
  instructionText: {
    fontSize: Typography.fontSize.sm,
    color: '#1e40af',
    lineHeight: 20,
  },
  commandCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  commandTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#eff6ff',
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  copyText: {
    fontSize: Typography.fontSize.sm,
    color: '#3b82f6',
    fontWeight: Typography.fontWeight.semibold,
  },
  commandCodeBox: {
    backgroundColor: '#1f2937',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  commandCode: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#10b981',
  },
  commandNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  commandNoteText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
  },
  summaryCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  summaryInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#6b7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
  },
  statusCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderColor: '#e5e7eb',
  },
  statusSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  statusError: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  statusTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statusSuccessText: {
    color: '#065f46',
  },
  statusErrorText: {
    color: '#991b1b',
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    marginTop: Spacing.lg,
  },
  verifyButton: {
    marginBottom: Spacing.md,
  },
  finishButton: {
    marginBottom: Spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: '#1f2937',
  },
  clearButton: {
    padding: Spacing.xs,
  },
  resultsCount: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginBottom: Spacing.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  modelsScrollView: {
    maxHeight: 400,
    marginBottom: Spacing.md,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    backgroundColor: '#f9fafb',
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.lg,
  },
  noResultsText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#6b7280',
    marginTop: Spacing.md,
  },
  noResultsSubtext: {
    fontSize: Typography.fontSize.sm,
    color: '#9ca3af',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
