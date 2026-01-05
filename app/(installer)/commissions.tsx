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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

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

export default function MyCommissionsScreen() {
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/installers/me/commissions');
      setCommissions(response.data);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommissions();
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
    if (filter === 'pending') {
      return commissions.filter((c) => c.paymentStatus === 'PENDING');
    }
    if (filter === 'paid') {
      return commissions.filter((c) => c.paymentStatus === 'PAID');
    }
    return commissions;
  };

  const getTotalEarned = () => {
    return commissions
      .filter((c) => c.paymentStatus === 'PAID')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
  };

  const getTotalPending = () => {
    return commissions
      .filter((c) => c.paymentStatus === 'PENDING')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
  };

  const filteredCommissions = getFilteredCommissions();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Mis Comisiones</Text>
            <Text style={styles.headerSubtitle}>
              {commissions.length} comisión{commissions.length !== 1 ? 'es' : ''}
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card variant="elevated" style={styles.summaryCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>
              {formatCurrency(getTotalEarned())}
            </Text>
            <Text style={styles.summaryLabel}>Total Pagado</Text>
          </Card>

          <Card variant="elevated" style={styles.summaryCard}>
            <Ionicons name="time-outline" size={24} color="#f59e0b" />
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
              {formatCurrency(getTotalPending())}
            </Text>
            <Text style={styles.summaryLabel}>Pendiente</Text>
          </Card>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'pending' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('pending')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'pending' && styles.filterTextActive,
            ]}
          >
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'paid' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('paid')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'paid' && styles.filterTextActive,
            ]}
          >
            Pagadas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <Text style={styles.loadingText}>Cargando...</Text>
        ) : filteredCommissions.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'No tienes comisiones'
                : filter === 'pending'
                ? 'No tienes comisiones pendientes'
                : 'No tienes comisiones pagadas'}
            </Text>
            <Text style={styles.emptySubtext}>
              Vincula clientes para empezar a ganar comisiones
            </Text>
          </Card>
        ) : (
          filteredCommissions.map((commission) => (
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
                  <Text style={styles.planText}>
                    Plan: {commission.subscriptionPlan} (
                    {formatCurrency(commission.subscriptionAmount)})
                  </Text>
                </View>

                <Badge
                  label={
                    commission.paymentStatus === 'PAID'
                      ? 'Pagado'
                      : commission.paymentStatus === 'PENDING'
                      ? 'Pendiente'
                      : 'Cancelado'
                  }
                  variant={
                    commission.paymentStatus === 'PAID'
                      ? 'success'
                      : commission.paymentStatus === 'PENDING'
                      ? 'warning'
                      : 'error'
                  }
                  size="sm"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.commissionFooter}>
                <View>
                  <Text style={styles.commissionLabel}>
                    Comisión (10%)
                  </Text>
                  <Text style={styles.commissionAmount}>
                    {formatCurrency(commission.commissionAmount)}
                  </Text>
                </View>

                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>
                    {formatDate(commission.createdAt)}
                  </Text>
                  {commission.paidAt && (
                    <View style={styles.paidContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#10b981"
                      />
                      <Text style={styles.paidDate}>
                        Pagado {formatDate(commission.paidAt)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  summaryValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginVertical: Spacing.xs / 2,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.sm,
    backgroundColor: '#ffffff',
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
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
  emptyCard: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  commissionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  commissionInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  clientName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  clientEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  planText: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: Spacing.md,
  },
  commissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  commissionLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginBottom: Spacing.xs / 2,
    textTransform: 'uppercase',
  },
  commissionAmount: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#7c3aed',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginBottom: Spacing.xs / 2,
  },
  paidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  paidDate: {
    fontSize: Typography.fontSize.xs,
    color: '#10b981',
    fontWeight: Typography.fontWeight.medium,
  },
});
