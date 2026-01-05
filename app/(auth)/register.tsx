import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/Theme';
import { Button } from '../../components/ui/Button';
import { CompassLoader } from '../../components/ui/CompassLoader';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || undefined,
        referralCode: formData.referralCode || undefined,
      });

      setSuccess('¡Cuenta creada exitosamente! Iniciando sesión...');

      // Auto login after successful registration
      await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // Navigate to onboarding
      setTimeout(() => {
        router.replace('/(onboarding)/welcome');
      }, 1500);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.message || 'No se pudo crear la cuenta. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Compass */}
          <View style={styles.logoContainer}>
            <CompassLoader size={100} />
            <Text style={styles.title}>Prologix GPS</Text>
            <Text style={styles.subtitle}>Crea tu cuenta</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Success Message */}
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez"
                placeholderTextColor={Colors.light.textTertiary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor={Colors.light.textTertiary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (809) 123-4567"
                placeholderTextColor={Colors.light.textTertiary}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código de Referencia (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="REF-INST-XXX"
                placeholderTextColor={Colors.light.textTertiary}
                value={formData.referralCode}
                onChangeText={(text) => setFormData({ ...formData, referralCode: text.toUpperCase() })}
                autoCapitalize="characters"
              />
              <Text style={styles.hint}>¿Te refirió un instalador? Ingresa su código aquí</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={Colors.light.textTertiary}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor={Colors.light.textTertiary}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry={!showPassword}
              />
            </View>

            <Button
              title="Crear Cuenta"
              onPress={handleRegister}
              loading={loading}
              variant="gradient"
              size="lg"
              fullWidth
              style={styles.registerButton}
            />

            <View style={styles.features}>
              <Text style={styles.featuresTitle}>✨ Con tu cuenta FREE obtienes:</Text>
              <Text style={styles.feature}>✓ 1 dispositivo GPS</Text>
              <Text style={styles.feature}>✓ Rastreo en tiempo real</Text>
              <Text style={styles.feature}>✓ Historial de 7 días</Text>
              <Text style={styles.feature}>✓ Notificaciones básicas</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'web' ? Spacing.xxxl : Spacing.xxl,
    paddingBottom: Platform.OS === 'web' ? Spacing.xxxl : Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.fontWeight.medium,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.xl,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#991b1b',
    fontWeight: Typography.fontWeight.medium,
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#065f46',
    fontWeight: Typography.fontWeight.medium,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
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
  hint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginTop: Spacing.xs / 2,
    fontStyle: 'italic',
  },
  registerButton: {
    marginTop: Spacing.base,
    marginBottom: Spacing.lg,
  },
  features: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  featuresTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  feature: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  link: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary['500'],
  },
});
