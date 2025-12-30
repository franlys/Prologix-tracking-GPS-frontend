import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface InstallerStats {
  installerId: string;
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

export default function InstallerDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [stats, setStats] = useState<InstallerStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payingCommission, setPayingCommission] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchStats();
    }
  }, [id]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/installers/${id}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching installer stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleMarkAsPaid = async (commissionId: string) => {
    if (Platform.OS === 'web') {
      if (!confirm('¿Marcar esta comisión como pagada?')) return;
    } else {
      Alert.alert(
        'Confirmar Pago',
        '¿Marcar esta comisión como pagada?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => await processPayment(commissionId),
          },
        ]
      );
      return;
    }

    await processPayment(commissionId);
  };

  const processPayment = async (commissionId: string) => {
    try {
      setPayingCommission(commissionId);
      await api.patch(`/installers/commissions/${commissionId}/mark-paid`, {
        notes: `Pagado el ${new Date().toLocaleDateString('es-DO')}`,
      });

      showAlert('Éxito', 'Comisión marcada como pagada');
      await fetchStats();
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      showAlert(
        'Error',
        error.response?.data?.message || 'No se pudo marcar como pagada'
      );
    } finally {
      setPayingCommission(null);
    }
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

  if (loading || !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Instalador</Text>
        <Text style={styles.headerSubtitle}>ID: {id}</Text>
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
            <Text style={styles.statLabel}>Clientes</Text>
          </Card>

          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCommissions}</Text>
            <Text style={styles.statLabel}>Comisiones</Text>
          </Card>

          <Card variant="elevated" style={[styles.statCard, styles.earnedCard]}>
            <Text style={[styles.statValue, styles.earnedValue]}>
              {formatCurrency(stats.totalEarned)}
            </Text>
            <Text style={styles.statLabel}>Ganado</Text>
          </Card>

          <Card variant="elevated" style={[styles.statCard, styles.pendingCard]}>
            <Text style={[styles.statValue, styles.pendingValue]}>
              {formatCurrency(stats.totalPending)}
            </Text>
            <Text style={styles.statLabel}>Pendiente</Text>
          </Card>
        </View>

        {/* Commissions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comisiones</Text>

          {stats.commissions.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>Sin comisiones aún</Text>
            </Card>
          ) : (
            stats.commissions.map((commission) => (
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
                    <Text style={styles.clientEmail}>
                      {commission.client.email}
                    </Text>
                    <Text style={styles.commissionDate}>
                      {formatDate(commission.createdAt)}
                    </Text>
                  </View>

                  <Badge
                    label={commission.paymentStatus}
                    variant={
                      commission.paymentStatus === 'PAID'
                        ? 'success'
                        : commission.paymentStatus === 'PENDING'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  />
                </View>

                <View style={styles.commissionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plan:</Text>
                    <Text style={styles.detailValue}>
                      {commission.subscriptionPlan}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Monto suscripción:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(commission.subscriptionAmount)}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, styles.commissionRow]}>
                    <Text style={styles.commissionLabel}>Comisión (10%):</Text>
                    <Text style={styles.commissionAmount}>
                      {formatCurrency(commission.commissionAmount)}
                    </Text>
                  </View>

                  {commission.paidAt && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pagado:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(commission.paidAt)}
                      </Text>
                    </View>
                  )}
                </View>

                {commission.paymentStatus === 'PENDING' && (
                  <Button
                    title="Marcar como Pagada"
                    onPress={() => handleMarkAsPaid(commission.id)}
                    variant="gradient"
                    gradient={['#10b981', '#059669']}
                    size="sm"
                    fullWidth
                    loading={payingCommission === commission.id}
                    style={styles.payButton}
                  />
                )}
              </Card>
            ))
          )}
        </View>
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
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
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
  clientEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  commissionDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
  },
  commissionDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.medium,
  },
  commissionRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  commissionLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  commissionAmount: {
    fontSize: Typography.fontSize.xl,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  payButton: {
    marginTop: Spacing.md,
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
    color: Colors.light.textSecondary,
  },
});
