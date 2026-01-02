import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface CommissionSummary {
  totalCommissions: number;
  totalPaid: number;
  totalPending: number;
  totalAmountPaid: number;
  totalAmountPending: number;
  commissions: Commission[];
}

interface Commission {
  id: string;
  installer: {
    id: string;
    name: string;
    email: string;
  };
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

export default function AdminCommissionsScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/installers/commissions/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching commissions summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
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

  const getFilteredCommissions = () => {
    if (!summary) return [];
    if (filter === 'ALL') return summary.commissions;
    return summary.commissions.filter((c) => c.paymentStatus === filter);
  };

  if (loading || !summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comisiones</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          Resumen y gestión de pagos a instaladores
        </Text>
      </View>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={[styles.statCard, styles.totalCard]}>
            <Text style={[styles.statValue, styles.totalValue]}>
              {summary.totalCommissions}
            </Text>
            <Text style={styles.statLabel}>Total Comisiones</Text>
          </Card>

          <Card variant="elevated" style={[styles.statCard, styles.paidCard]}>
            <Text style={[styles.statValue, styles.paidValue]}>
              {formatCurrency(summary.totalAmountPaid)}
            </Text>
            <Text style={styles.statLabel}>Pagado</Text>
            <Text style={styles.statCount}>({summary.totalPaid} comisiones)</Text>
          </Card>

          <Card variant="elevated" style={[styles.statCard, styles.pendingCard]}>
            <Text style={[styles.statValue, styles.pendingValue]}>
              {formatCurrency(summary.totalAmountPending)}
            </Text>
            <Text style={styles.statLabel}>Pendiente</Text>
            <Text style={styles.statCount}>
              ({summary.totalPending} comisiones)
            </Text>
          </Card>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
            onPress={() => setFilter('ALL')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'ALL' && styles.filterTabTextActive,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'PENDING' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('PENDING')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'PENDING' && styles.filterTabTextActive,
              ]}
            >
              Pendientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'PAID' && styles.filterTabActive]}
            onPress={() => setFilter('PAID')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'PAID' && styles.filterTabTextActive,
              ]}
            >
              Pagadas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Commissions List */}
        <FlatList
          data={getFilteredCommissions()}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card variant="elevated" style={styles.commissionCard}>
              <View style={styles.commissionHeader}>
                <View style={styles.installerInfo}>
                  <Text style={styles.installerLabel}>Instalador:</Text>
                  <Text style={styles.installerName}>{item.installer.name}</Text>
                  <Text style={styles.installerEmail}>
                    {item.installer.email}
                  </Text>
                </View>

                <Badge
                  label={item.paymentStatus}
                  variant={
                    item.paymentStatus === 'PAID'
                      ? 'success'
                      : item.paymentStatus === 'PENDING'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="sm"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.clientSection}>
                <Text style={styles.clientLabel}>Cliente:</Text>
                <Text style={styles.clientName}>{item.client.name}</Text>
                <Text style={styles.clientEmail}>{item.client.email}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Plan:</Text>
                  <Text style={styles.detailValue}>{item.subscriptionPlan}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monto suscripción:</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(item.subscriptionAmount)}
                  </Text>
                </View>

                <View style={[styles.detailRow, styles.commissionRow]}>
                  <Text style={styles.commissionLabel}>Comisión (10%):</Text>
                  <Text style={styles.commissionAmount}>
                    {formatCurrency(item.commissionAmount)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {item.paidAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Pagado:</Text>
                    <View style={styles.paidDateContainer}>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <Text style={[styles.detailValue, styles.paidDate]}>
                        {formatDate(item.paidAt)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <Card variant="outlined" style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cash-outline" size={64} color="#9ca3af" />
              </View>
              <Text style={styles.emptyText}>
                No hay comisiones {filter !== 'ALL' && filter.toLowerCase()}
              </Text>
            </Card>
          }
        />
      </View>
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
    marginBottom: Spacing.xs,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3f4f6',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    paddingHorizontal: Spacing.base,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing.xxxl,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  statCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginTop: Spacing.xs / 2,
  },
  totalCard: {
    flex: 1,
    minWidth: '100%',
  },
  totalValue: {
    color: Colors.light.primary,
  },
  paidCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  paidValue: {
    color: '#059669',
  },
  pendingCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  pendingValue: {
    color: '#d97706',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  commissionCard: {
    marginBottom: Spacing.md,
  },
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  installerInfo: {
    flex: 1,
  },
  installerLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    textTransform: 'uppercase',
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs / 2,
  },
  installerName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  installerEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.md,
  },
  clientSection: {
    marginBottom: Spacing.md,
  },
  clientLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    textTransform: 'uppercase',
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs / 2,
  },
  clientName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  clientEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  detailsSection: {
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
    color: '#10b981',
    fontWeight: Typography.fontWeight.bold,
  },
  paidDate: {
    color: '#10b981',
    marginLeft: Spacing.xs / 2,
  },
  paidDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCard: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: Spacing.base,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
