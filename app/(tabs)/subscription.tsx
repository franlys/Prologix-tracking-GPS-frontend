import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { PlanCard, Plan } from '../../components/subscription/PlanCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'FREE',
    description: 'Plan gratuito para probar',
    price: 0,
    billingPeriod: 'MONTHLY',
    currency: '$',
    gradient: Colors.plans.free.gradient,
    maxDevices: 1,
    maxGeofences: 1,
    maxSharedUsers: 0,
    features: [
      { name: 'Rastreo en tiempo real', included: true },
      { name: 'Historial de 7 días', included: true, value: '7 días' },
      { name: 'Notificaciones básicas', included: true },
      { name: 'Geofences', included: true, value: '1' },
      { name: 'Notificaciones avanzadas', included: false },
      { name: 'Reportes personalizados', included: false },
      { name: 'API Access', included: false },
    ],
  },
  {
    id: 'basico',
    name: 'BASICO',
    description: 'Ideal para uso personal',
    price: 9.99,
    billingPeriod: 'MONTHLY',
    currency: '$',
    gradient: Colors.plans.basico.gradient,
    maxDevices: 3,
    maxGeofences: 10,
    maxSharedUsers: 2,
    features: [
      { name: 'Rastreo en tiempo real', included: true },
      { name: 'Historial de 30 días', included: true, value: '30 días' },
      { name: 'Notificaciones avanzadas', included: true },
      { name: 'Geofences', included: true, value: '10' },
      { name: 'Usuarios compartidos', included: true, value: '2' },
      { name: 'Reportes básicos', included: true },
      { name: 'API Access', included: false },
    ],
  },
  {
    id: 'profesional',
    name: 'PROFESIONAL',
    description: 'Para pequeños negocios',
    price: 24.99,
    billingPeriod: 'MONTHLY',
    currency: '$',
    gradient: Colors.plans.profesional.gradient,
    recommended: true,
    maxDevices: 10,
    maxGeofences: 50,
    maxSharedUsers: 5,
    features: [
      { name: 'Rastreo en tiempo real', included: true },
      { name: 'Historial de 90 días', included: true, value: '90 días' },
      { name: 'Notificaciones avanzadas', included: true },
      { name: 'Geofences ilimitadas', included: true, value: '50+' },
      { name: 'Usuarios compartidos', included: true, value: '5' },
      { name: 'Reportes personalizados', included: true },
      { name: 'Soporte prioritario', included: true },
      { name: 'API Access', included: false },
    ],
  },
  {
    id: 'empresarial',
    name: 'EMPRESARIAL',
    description: 'Solución completa para empresas',
    price: 49.99,
    billingPeriod: 'MONTHLY',
    currency: '$',
    gradient: Colors.plans.empresarial.gradient,
    maxDevices: 50,
    maxGeofences: 200,
    maxSharedUsers: 20,
    features: [
      { name: 'Rastreo en tiempo real', included: true },
      { name: 'Historial ilimitado', included: true, value: 'Ilimitado' },
      { name: 'Notificaciones ilimitadas', included: true },
      { name: 'Geofences ilimitadas', included: true, value: '200+' },
      { name: 'Usuarios compartidos', included: true, value: '20' },
      { name: 'Reportes personalizados', included: true },
      { name: 'Soporte 24/7', included: true },
      { name: 'API Access completo', included: true },
      { name: 'White label', included: true },
    ],
  },
];

export default function SubscriptionScreen() {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/me');
      setCurrentSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.price === 0) {
      showAlert('Plan Gratuito', 'Este es tu plan actual gratuito.');
      return;
    }

    if (currentSubscription?.plan === plan.name) {
      showAlert('Plan Actual', 'Ya tienes este plan activo.');
      return;
    }

    setLoading(true);
    try {
      // Create Stripe checkout session
      const response = await api.post('/subscriptions/checkout/create', {
        planId: plan.id,
        billingPeriod: plan.billingPeriod,
      });

      const { url } = response.data;

      if (Platform.OS === 'web') {
        window.location.href = url;
      } else {
        showAlert(
          'Abrir en Navegador',
          'Por favor completa el pago en el navegador web.'
        );
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      showAlert(
        'Error',
        error.response?.data?.message || 'No se pudo iniciar el proceso de pago'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>Planes y Suscripciones</Text>
        <Text style={styles.subtitle}>
          Elige el plan perfecto para tus necesidades de rastreo GPS
        </Text>
      </LinearGradient>

      <View style={styles.mainContent}>
        {/* Current Plan Info */}
        {currentSubscription && (
          <Card variant="elevated" style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>Tu Plan Actual</Text>
              <Badge
                label={currentSubscription.plan || 'FREE'}
                variant={
                  currentSubscription.plan === 'FREE'
                    ? 'neutral'
                    : currentSubscription.plan === 'BASICO'
                    ? 'info'
                    : currentSubscription.plan === 'PROFESIONAL'
                    ? 'premium'
                    : 'warning'
                }
              />
            </View>

            {currentSubscription.status === 'TRIALING' && currentSubscription.trialEndsAt && (
              <View style={styles.trialBanner}>
                <Text style={styles.trialIcon}>🎁</Text>
                <View style={styles.trialTextContainer}>
                  <Text style={styles.trialTitle}>Trial Gratuito Activo</Text>
                  <Text style={styles.trialText}>
                    Termina: {new Date(currentSubscription.trialEndsAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.currentPlanStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentSubscription.maxDevices || 1}</Text>
                <Text style={styles.statLabel}>Dispositivos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentSubscription.maxGeofences || 1}</Text>
                <Text style={styles.statLabel}>Geofences</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {currentSubscription.historyRetentionDays || 7}
                </Text>
                <Text style={styles.statLabel}>Días historial</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Billing Period Toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, billingPeriod === 'MONTHLY' && styles.toggleButtonActive]}
            onPress={() => setBillingPeriod('MONTHLY')}
          >
            <Text
              style={[
                styles.toggleText,
                billingPeriod === 'MONTHLY' && styles.toggleTextActive,
              ]}
            >
              Mensual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, billingPeriod === 'YEARLY' && styles.toggleButtonActive]}
            onPress={() => setBillingPeriod('YEARLY')}
          >
            <Text
              style={[styles.toggleText, billingPeriod === 'YEARLY' && styles.toggleTextActive]}
            >
              Anual
              <Text style={styles.saveBadge}> (Ahorra 20%)</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plans List */}
        <View style={styles.plansList}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={{
                ...plan,
                billingPeriod,
                price: billingPeriod === 'YEARLY' ? plan.price * 12 * 0.8 : plan.price,
              }}
              currentPlan={currentSubscription?.plan}
              onSelect={handleSelectPlan}
            />
          ))}
        </View>

        {/* FAQ or Additional Info */}
        <Card variant="outlined" style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 ¿Necesitas ayuda para elegir?</Text>
          <Text style={styles.infoText}>
            • Todos los planes incluyen rastreo en tiempo real{'\n'}
            • Puedes cambiar o cancelar tu plan en cualquier momento{'\n'}
            • Prueba gratuita de 7 días en todos los planes pagos{'\n'}
            • Soporte técnico incluido en todos los planes
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'web' ? Spacing.xl : Spacing.xxxl,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  mainContent: {
    padding: Spacing.base,
    marginTop: -Spacing.xl,
  },
  currentPlanCard: {
    marginBottom: Spacing.lg,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  currentPlanTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  trialBanner: {
    flexDirection: 'row',
    backgroundColor: '#d1fae5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
  },
  trialIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  trialTextContainer: {
    flex: 1,
  },
  trialTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#065f46',
    marginBottom: Spacing.xs / 2,
  },
  trialText: {
    fontSize: Typography.fontSize.sm,
    color: '#047857',
  },
  currentPlanStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary['500'],
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary['500'],
  },
  toggleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  saveBadge: {
    fontSize: Typography.fontSize.xs,
    color: '#10b981',
  },
  plansList: {
    marginBottom: Spacing.lg,
  },
  infoCard: {
    padding: Spacing.lg,
  },
  infoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
});
