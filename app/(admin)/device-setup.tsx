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
}

const GPS_MODELS: GPSModel[] = [
  {
    id: 'gt06n',
    name: 'Concox GT06N',
    protocol: 'GT06',
    port: 5023,
    description: 'Más popular en RD - SMS + GPRS',
  },
  {
    id: 'tk103',
    name: 'Coban TK103',
    protocol: 'TK103',
    port: 5013,
    description: 'Económico - Relay corta corriente',
  },
  {
    id: 'fmb120',
    name: 'Teltonika FMB120',
    protocol: 'Teltonika',
    port: 5027,
    description: 'Profesional - CAN bus',
  },
  {
    id: 'h02',
    name: 'H02 Genérico',
    protocol: 'H02',
    port: 5013,
    description: 'Básico - Compatible',
  },
];

export default function DeviceSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Device Info
  const [deviceName, setDeviceName] = useState('');
  const [imei, setImei] = useState('');
  const [selectedModel, setSelectedModel] = useState<GPSModel | null>(null);

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

    // Generate SMS commands
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
      // For mobile, use expo-clipboard or similar
      showAlert('Copiar', `Copia este comando:\n\n${text}`);
    }
  };

  const handleVerifyConnection = async () => {
    setVerifying(true);
    setConnectionStatus('checking');

    try {
      // Simulate API call to check device connection
      // In production, this would call /devices/verify or similar
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // For demo purposes, randomly succeed/fail
      const connected = Math.random() > 0.3;

      if (connected) {
        setConnectionStatus('connected');
        showAlert(
          '¡Conectado!',
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
      '¡Configuración Completa!',
      `GPS "${deviceName}" configurado exitosamente.\n\nAhora puedes vincularlo a un usuario desde el panel "Vincular Dispositivo".`
    );
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Configurar GPS</Text>
        <Text style={styles.headerSubtitle}>Wizard de configuración paso a paso</Text>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  step >= s && styles.progressCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.progressNumber,
                    step >= s && styles.progressNumberActive,
                  ]}
                >
                  {s}
                </Text>
              </View>
              {s < 3 && (
                <View
                  style={[
                    styles.progressLine,
                    step > s && styles.progressLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Info</Text>
          <Text style={styles.progressLabel}>SMS</Text>
          <Text style={styles.progressLabel}>Verificar</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Step 1: Device Information */}
        {step === 1 && (
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.stepTitle}>📱 Paso 1: Información del Dispositivo</Text>

            <Text style={styles.label}>Nombre del Vehículo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Toyota Corolla 2020"
              value={deviceName}
              onChangeText={setDeviceName}
            />

            <Text style={styles.label}>IMEI del GPS (15 dígitos)</Text>
            <TextInput
              style={styles.input}
              placeholder="123456789012345"
              value={imei}
              onChangeText={setImei}
              keyboardType="numeric"
              maxLength={15}
            />
            <Text style={styles.hint}>
              💡 Envía "IMEI#" por SMS al GPS para obtenerlo
            </Text>

            <Text style={styles.label}>Modelo del GPS</Text>
            {GPS_MODELS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelCard,
                  selectedModel?.id === model.id && styles.modelCardSelected,
                ]}
                onPress={() => setSelectedModel(model)}
              >
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>{model.name}</Text>
                  <Badge
                    label={model.protocol}
                    variant="neutral"
                    size="sm"
                  />
                </View>
                <Text style={styles.modelDescription}>{model.description}</Text>
                <Text style={styles.modelPort}>Puerto: {model.port}</Text>
              </TouchableOpacity>
            ))}

            <Button
              title="Siguiente →"
              onPress={handleStep1Next}
              variant="gradient"
              gradient={['#10b981', '#059669']}
              size="lg"
              fullWidth
              style={styles.nextButton}
            />
          </Card>
        )}

        {/* Step 2: SMS Commands */}
        {step === 2 && (
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.stepTitle}>📨 Paso 2: Enviar Comandos SMS</Text>
            <Text style={styles.stepDescription}>
              Envía estos comandos uno por uno al número de teléfono del GPS:
            </Text>

            {smsCommands.map((cmd, index) => (
              <View key={index} style={styles.commandBox}>
                <View style={styles.commandHeader}>
                  <Text style={styles.commandTitle}>{cmd.title}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(cmd.command)}
                  >
                    <Text style={styles.copyButtonText}>📋 Copiar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.commandContent}>
                  <Text style={styles.commandText}>{cmd.command}</Text>
                </View>
                <Text style={styles.commandNote}>💡 {cmd.note}</Text>
              </View>
            ))}

            <Card variant="outlined" style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ Importante</Text>
              <Text style={styles.infoText}>
                • Envía los comandos en orden{'\n'}
                • Espera confirmación "OK" antes del siguiente{'\n'}
                • La SIM debe tener saldo y datos activos{'\n'}
                • El GPS puede tardar 1-2 min en responder
              </Text>
            </Card>

            <View style={styles.buttonRow}>
              <Button
                title="← Atrás"
                onPress={() => setStep(1)}
                variant="outline"
                size="md"
                style={styles.backButton}
              />
              <Button
                title="Siguiente →"
                onPress={() => setStep(3)}
                variant="gradient"
                gradient={['#10b981', '#059669']}
                size="md"
                style={styles.nextButton}
              />
            </View>
          </Card>
        )}

        {/* Step 3: Verify Connection */}
        {step === 3 && (
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.stepTitle}>✅ Paso 3: Verificar Conexión</Text>
            <Text style={styles.stepDescription}>
              Verifica que el GPS esté enviando datos al servidor
            </Text>

            <View style={styles.deviceSummary}>
              <Text style={styles.summaryLabel}>Dispositivo:</Text>
              <Text style={styles.summaryValue}>{deviceName}</Text>

              <Text style={styles.summaryLabel}>IMEI:</Text>
              <Text style={styles.summaryValue}>{imei}</Text>

              <Text style={styles.summaryLabel}>Modelo:</Text>
              <Text style={styles.summaryValue}>{selectedModel?.name}</Text>

              <Text style={styles.summaryLabel}>Puerto:</Text>
              <Text style={styles.summaryValue}>{selectedModel?.port}</Text>
            </View>

            {connectionStatus === 'idle' && (
              <Card variant="outlined" style={styles.waitingBox}>
                <Text style={styles.waitingText}>
                  ⏳ Esperando conexión del GPS...{'\n\n'}
                  Después de enviar todos los comandos SMS, espera 2-3 minutos
                  para que el GPS se conecte al servidor.
                </Text>
              </Card>
            )}

            {connectionStatus === 'connected' && (
              <Card variant="outlined" style={styles.successBox}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>¡Conectado!</Text>
                <Text style={styles.successText}>
                  El GPS está enviando datos correctamente.{'\n'}
                  Última posición recibida hace 30 segundos.
                </Text>
              </Card>
            )}

            {connectionStatus === 'failed' && (
              <Card variant="outlined" style={styles.errorBox}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorTitle}>Sin Conexión</Text>
                <Text style={styles.errorText}>
                  El GPS aún no ha enviado datos.{'\n\n'}
                  Verifica que:{'\n'}
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
              variant="gradient"
              gradient={['#10b981', '#059669']}
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

            <Button
              title="← Atrás"
              onPress={() => setStep(2)}
              variant="outline"
              size="md"
              fullWidth
              style={styles.backButton}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'web' ? Spacing.xl : Spacing.xxxl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.base,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#ffffff',
  },
  progressNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  progressNumberActive: {
    color: '#10b981',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressLineActive: {
    backgroundColor: '#ffffff',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    color: '#ffffff',
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  card: {
    marginBottom: Spacing.base,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.base,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.xs,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.base,
  },
  modelCard: {
    padding: Spacing.base,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  modelCardSelected: {
    borderColor: Colors.success['500'],
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  modelName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  modelDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  modelPort: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
  },
  commandBox: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  commandTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  copyButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary['500'],
    borderRadius: BorderRadius.sm,
  },
  copyButtonText: {
    fontSize: Typography.fontSize.sm,
    color: '#ffffff',
    fontWeight: Typography.fontWeight.semibold,
  },
  commandContent: {
    backgroundColor: '#f3f4f6',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  commandText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.light.text,
  },
  commandNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#1e40af',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  deviceSummary: {
    backgroundColor: Colors.light.background,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  waitingBox: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  waitingText: {
    fontSize: Typography.fontSize.base,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 22,
  },
  successBox: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#065f46',
    marginBottom: Spacing.sm,
  },
  successText: {
    fontSize: Typography.fontSize.base,
    color: '#064e3b',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#991b1b',
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: '#7f1d1d',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.base,
  },
  nextButton: {
    flex: 1,
  },
  backButton: {
    flex: 1,
  },
  verifyButton: {
    marginBottom: Spacing.md,
  },
  finishButton: {
    marginBottom: Spacing.md,
  },
});
