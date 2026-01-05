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
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscriptionPlan: string;
  subscriptionStartDate: string;
}

export default function MyClientsScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/installers/me/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'BASIC':
        return '#3b82f6';
      case 'PRO':
        return '#8b5cf6';
      case 'ENTERPRISE':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

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
            <Text style={styles.headerTitle}>Mis Clientes</Text>
            <Text style={styles.headerSubtitle}>
              {clients.length} cliente{clients.length !== 1 ? 's' : ''} vinculado{clients.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
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
        ) : clients.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No tienes clientes vinculados</Text>
            <Text style={styles.emptySubtext}>
              Cuando vincules clientes, aparecerán aquí
            </Text>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id} variant="elevated" style={styles.clientCard}>
              <View style={styles.clientHeader}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={24} color="#ffffff" />
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientEmail}>{client.email}</Text>
                  {client.phone && (
                    <View style={styles.phoneRow}>
                      <Ionicons name="call-outline" size={14} color="#6b7280" />
                      <Text style={styles.clientPhone}>{client.phone}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.clientFooter}>
                <View style={styles.planContainer}>
                  <Text style={styles.planLabel}>Plan</Text>
                  <View
                    style={[
                      styles.planBadge,
                      { backgroundColor: getPlanColor(client.subscriptionPlan) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.planText,
                        { color: getPlanColor(client.subscriptionPlan) },
                      ]}
                    >
                      {client.subscriptionPlan}
                    </Text>
                  </View>
                </View>

                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>Cliente desde</Text>
                  <Text style={styles.dateText}>
                    {formatDate(client.subscriptionStartDate)}
                  </Text>
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
  clientCard: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  clientHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  clientInfo: {
    flex: 1,
    justifyContent: 'center',
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  clientPhone: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: Spacing.md,
  },
  clientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planContainer: {
    flex: 1,
  },
  planLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginBottom: Spacing.xs / 2,
    textTransform: 'uppercase',
    fontWeight: Typography.fontWeight.semibold,
  },
  planBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  planText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginBottom: Spacing.xs / 2,
  },
  dateText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.medium,
  },
});
