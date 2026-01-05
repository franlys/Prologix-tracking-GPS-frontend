import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../context/ctx';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface InstallerStats {
  totalClients: number;
  totalCommissions: number;
  totalEarned: number;
  totalPending: number;
  commissions: Commission[];
}

interface Commission {
  id: string;
  client: {
    name: string;
    email: string;
  };
  subscriptionPlan: string;
  subscriptionAmount: number;
  commissionAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  paidAt?: string;
}

export default function InstallerDashboardScreen() {
  const router = useRouter();
  const { signOut } = useSession();
  const [stats, setStats] = useState<InstallerStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/installers/me/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      const errorMessage = error.response?.status === 403
        ? 'No tienes permisos para acceder a esta información. Contacta al administrador.'
        : 'Error al cargar tus estadísticas. Por favor intenta de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPendingCommissions = () => {
    if (!stats) return [];
    return stats.commissions.filter((c) => c.paymentStatus === 'PENDING');
  };

  const getRecentCommissions = () => {
    if (!stats) return [];
    return stats.commissions.slice(0, 5);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            title="Reintentar"
            onPress={fetchStats}
            variant="primary"
            style={styles.retryButton}
          />
          <Button
            title="Cerrar Sesión"
            onPress={() => {
              signOut();
              router.replace('/(auth)/login');
            }}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Panel de Instalador</Text>
            <Text style={styles.headerSubtitle}>
              Tus comisiones y clientes
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              signOut();
              router.replace('/(auth)/login');
            }}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalClients}</Text>
            <Text style={styles.statLabel}>Mis Clientes</Text>
          </Card>

          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCommissions}</Text>
            <Text style={styles.statLabel}>Comisiones</Text>
          </Card>

          <Card
            variant="elevated"
            style={[styles.statCard, styles.fullWidth, styles.earnedCard]}
          >
            <Text style={[styles.statValue, styles.earnedValue]}>
              {formatCurrency(stats.totalEarned)}
            </Text>
            <Text style={styles.statLabel}>Total Ganado</Text>
          </Card>

          <Card
            variant="elevated"
            style={[styles.statCard, styles.fullWidth, styles.pendingCard]}
          >
            <Text style={[styles.statValue, styles.pendingValue]}>
              {formatCurrency(stats.totalPending)}
            </Text>
            <Text style={styles.statLabel}>Pendiente de Pago</Text>
            <Text style={styles.statSubtext}>
              {getPendingCommissions().length} comisiones pendientes
            </Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

          <View style={styles.actionsGrid}>
            <Button
              title="Mis Clientes"
              onPress={() => router.push('/(installer)/clients')}
              variant="outline"
              size="md"
              style={styles.actionButton}
            />

            <Button
              title="Mis Comisiones"
              onPress={() => router.push('/(installer)/commissions')}
              variant="outline"
              size="md"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Recent Commissions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comisiones Recientes</Text>
            <TouchableOpacity
              onPress={() => router.push('/(installer)/commissions')}
            >
              <Text style={styles.viewAllText}>Ver todas →</Text>
            </TouchableOpacity>
          </View>

          {getRecentCommissions().length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>
                Aún no tienes comisiones
              </Text>
              <Text style={styles.emptySubtext}>
                Vincula clientes para empezar a ganar comisiones
              </Text>
            </Card>
          ) : (
            getRecentCommissions().map((commission) => (
              <Card
                key={commission.id}
                variant="elevated"
                style={styles.commissionCard}
              >
                <View style={styles.commissionHeader}>
                  <View style={styles.commissionInfo}>
                    <Text style={styles.clientName}>
                      {commission.client.name}
                    </Text>
                    <Text style={styles.commissionPlan}>
                      Plan: {commission.subscriptionPlan}
                    </Text>
                  </View>

                  <Badge
                    label={commission.paymentStatus}
                    variant={
                      commission.paymentStatus === 'PAID'
                        ? 'success'
                        : 'warning'
                    }
                    size="sm"
                  />
                </View>

                <View style={styles.commissionFooter}>
                  <View>
                    <Text style={styles.commissionLabel}>Comisión (10%):</Text>
                    <Text style={styles.commissionAmount}>
                      {formatCurrency(commission.commissionAmount)}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.commissionDate}>
                      {formatDate(commission.createdAt)}
                    </Text>
                    {commission.paidAt && (
                      <Text style={styles.paidDate}>
                        ✓ Pagado {formatDate(commission.paidAt)}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Info Card */}
        <Card variant="outlined" style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
          <Text style={styles.infoText}>
            • Ganas 10% de comisión por la primera suscripción de cada cliente
            {'\n'}
            • Solo se paga comisión una vez por cliente
            {'\n'}
            • Las comisiones pendientes se pagan mensualmente
            {'\n'}
            • Vincula más clientes para aumentar tus ganancias
          </Text>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
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
  logoutButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing.xxxl,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.base,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#dc2626',
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  retryButton: {
    marginBottom: Spacing.md,
    minWidth: 200,
  },
  logoutButton: {
    minWidth: 200,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  fullWidth: {
    minWidth: '100%',
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  earnedCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  earnedValue: {
    color: '#059669',
  },
  pendingCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  pendingValue: {
    color: '#d97706',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  commissionCard: {
    marginBottom: Spacing.md,
  },
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  commissionInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  commissionPlan: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  commissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  commissionLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  commissionAmount: {
    fontSize: Typography.fontSize.xl,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  commissionDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    textAlign: 'right',
  },
  paidDate: {
    fontSize: Typography.fontSize.xs,
    color: '#10b981',
    marginTop: Spacing.xs / 2,
    textAlign: 'right',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    padding: Spacing.lg,
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
});
