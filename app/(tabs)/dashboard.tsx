import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/Theme';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    inactiveDevices: 0,
    alerts: 0,
  });
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch devices
      const devicesResponse = await api.get('/devices');
      const devices = devicesResponse.data;

      setStats({
        totalDevices: devices.length,
        activeDevices: devices.filter((d: any) => d.online).length,
        inactiveDevices: devices.filter((d: any) => !d.online).length,
        alerts: 0, // TODO: Implement alerts
      });

      // Fetch subscription info
      try {
        const subResponse = await api.get('/subscriptions/me');
        setSubscription(subResponse.data);
      } catch (error) {
        console.log('No subscription data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan?.toUpperCase()) {
      case 'FREE':
        return 'neutral';
      case 'BASICO':
        return 'info';
      case 'PROFESIONAL':
        return 'premium';
      case 'EMPRESARIAL':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getPlanGradient = (plan: string) => {
    switch (plan?.toUpperCase()) {
      case 'FREE':
        return Colors.plans.free.gradient;
      case 'BASICO':
        return Colors.plans.basico.gradient;
      case 'PROFESIONAL':
        return Colors.plans.profesional.gradient;
      case 'EMPRESARIAL':
        return Colors.plans.empresarial.gradient;
      default:
        return Colors.plans.free.gradient;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.greeting}>¡Bienvenido!</Text>
        <Text style={styles.headerTitle}>Dashboard GPS</Text>
        {subscription && (
          <View style={styles.planBadgeContainer}>
            <Badge
              label={`Plan ${subscription.plan || 'FREE'}`}
              variant={getPlanBadgeVariant(subscription.plan)}
            />
          </View>
        )}
      </LinearGradient>

      <View style={styles.mainContent}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard
            title="Total Dispositivos"
            value={stats.totalDevices}
            icon="📱"
            subtitle="Registrados"
          />
          <StatsCard
            title="Activos"
            value={stats.activeDevices}
            icon="✅"
            subtitle="En línea"
            gradient={['#10b981', '#06b6d4']}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="Inactivos"
            value={stats.inactiveDevices}
            icon="⏸️"
            subtitle="Fuera de línea"
          />
          <StatsCard
            title="Alertas"
            value={stats.alerts}
            icon="🔔"
            subtitle="Pendientes"
            gradient={['#f59e0b', '#ef4444']}
          />
        </View>

        {/* Quick Actions */}
        <QuickActions />

        {/* Subscription Info */}
        {subscription && (
          <Card variant="elevated" style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Text style={styles.cardTitle}>Tu Plan Actual</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/subscription' as any)}>
                <Text style={styles.upgradeLink}>Ver Planes →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.planInfo}>
              <LinearGradient
                colors={getPlanGradient(subscription.plan)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.planBadge}
              >
                <Text style={styles.planName}>{subscription.plan || 'FREE'}</Text>
              </LinearGradient>

              {subscription.status === 'TRIALING' && subscription.trialEndsAt && (
                <View style={styles.trialInfo}>
                  <Badge label="🎁 Trial Activo" variant="success" />
                  <Text style={styles.trialText}>
                    Termina: {new Date(subscription.trialEndsAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.limits}>
              <View style={styles.limitItem}>
                <ProgressBar
                  label="Dispositivos"
                  current={stats.totalDevices}
                  max={subscription.maxDevices || 1}
                  gradient={getPlanGradient(subscription.plan)}
                />
              </View>

              <View style={styles.limitItem}>
                <ProgressBar
                  label="Geofences"
                  current={0}
                  max={subscription.maxGeofences || 1}
                  gradient={getPlanGradient(subscription.plan)}
                />
              </View>

              {subscription.maxSharedUsers > 0 && (
                <View style={styles.limitItem}>
                  <ProgressBar
                    label="Usuarios Compartidos"
                    current={0}
                    max={subscription.maxSharedUsers}
                    gradient={getPlanGradient(subscription.plan)}
                  />
                </View>
              )}
            </View>

            {subscription.maxDevices && stats.totalDevices >= subscription.maxDevices && (
              <View style={styles.limitWarning}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  Has alcanzado el límite de dispositivos. Upgrade para agregar más.
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Features Info */}
        <Card variant="outlined" style={styles.featuresCard}>
          <Text style={styles.cardTitle}>Características Disponibles</Text>

          <View style={styles.featuresList}>
            {subscription?.hasRealtimeTracking !== false && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Rastreo en tiempo real</Text>
              </View>
            )}

            {subscription?.hasHistoricalReports !== false && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Historial de rutas</Text>
              </View>
            )}

            {subscription?.hasGeofences !== false && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Geofences (zonas seguras)</Text>
              </View>
            )}

            {subscription?.hasNotifications !== false && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Notificaciones</Text>
              </View>
            )}

            {subscription?.hasAdvancedReports && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Reportes avanzados</Text>
              </View>
            )}

            {subscription?.hasAPIAccess && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Acceso API</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Getting Started (if no devices) */}
        {stats.totalDevices === 0 && (
          <Card gradient={['#3b82f6', '#8b5cf6']} style={styles.gettingStartedCard}>
            <Text style={styles.gettingStartedTitle}>🚀 Primeros Pasos</Text>
            <Text style={styles.gettingStartedText}>
              Para comenzar a rastrear tus dispositivos GPS:
            </Text>
            <View style={styles.stepsList}>
              <Text style={styles.step}>1. Contacta a tu instalador</Text>
              <Text style={styles.step}>2. El instalador vinculará tu dispositivo GPS</Text>
              <Text style={styles.step}>3. ¡Empieza a rastrear en tiempo real!</Text>
            </View>
          </Card>
        )}
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
  greeting: {
    fontSize: Typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.xs / 2,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  planBadgeContainer: {
    marginTop: Spacing.md,
  },
  mainContent: {
    padding: Spacing.base,
    marginTop: -Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  subscriptionCard: {
    marginBottom: Spacing.lg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  upgradeLink: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  planBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  planName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  trialInfo: {
    alignItems: 'flex-end',
  },
  trialText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  limits: {
    gap: Spacing.base,
  },
  limitItem: {
    marginBottom: Spacing.sm,
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.base,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#92400e',
  },
  featuresCard: {
    marginBottom: Spacing.lg,
  },
  featuresList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  gettingStartedCard: {
    padding: Spacing.lg,
  },
  gettingStartedTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.sm,
  },
  gettingStartedText: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.md,
  },
  stepsList: {
    gap: Spacing.sm,
  },
  step: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: Typography.fontWeight.medium,
  },
});
