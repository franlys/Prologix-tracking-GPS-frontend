import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function CreateInstallerScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [creating, setCreating] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleCreate = async () => {
    // Validations
    if (!name || !email || !password) {
      showAlert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password.length < 6) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!email.includes('@')) {
      showAlert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setCreating(true);
    try {
      // Step 1: Register user
      const registerResponse = await api.post('/auth/register', {
        email,
        password,
        name,
        phoneNumber: phoneNumber || undefined,
      });

      const userId = registerResponse.data.user.id;

      // Step 2: Promote to INSTALLER
      await api.patch(`/admin/users/${userId}/role`, {
        role: 'INSTALLER',
      });

      showAlert('Éxito', 'Instalador creado exitosamente');
      router.back();
    } catch (error: any) {
      console.error('Error creating installer:', error);
      showAlert(
        'Error',
        error.response?.data?.message || 'No se pudo crear el instalador'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Instalador</Text>
        <Text style={styles.headerSubtitle}>Nuevo perfil de instalador</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" style={styles.formCard}>
          <Text style={styles.formTitle}>Información del Instalador</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nombre Completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor={Colors.light.textTertiary}
              value={name}
              onChangeText={setName}
              editable={!creating}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="instalador@ejemplo.com"
              placeholderTextColor={Colors.light.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!creating}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Contraseña <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.light.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!creating}
            />
            <Text style={styles.helperText}>
              El instalador podrá cambiar su contraseña después
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 809 123 4567"
              placeholderTextColor={Colors.light.textTertiary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!creating}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Permisos del Instalador</Text>
              <Text style={styles.infoText}>
                • Puede vincular clientes a su perfil{'\n'}
                • Ve sus propias comisiones{'\n'}
                • Gana 10% por primera suscripción de cada cliente
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
              disabled={creating}
            />

            <Button
              title="Crear Instalador"
              onPress={handleCreate}
              variant="gradient"
              gradient={['#7c3aed', '#a78bfa']}
              size="lg"
              loading={creating}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
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
  backButton: {
    marginBottom: Spacing.md,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
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
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  formCard: {
    padding: Spacing.xl,
  },
  formTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginTop: Spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginVertical: Spacing.lg,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  infoText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.base,
  },
});
