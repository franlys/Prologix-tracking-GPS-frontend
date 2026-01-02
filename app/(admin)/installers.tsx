import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Installer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export default function AdminInstallersScreen() {
  const router = useRouter();
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstallers();
  }, []);

  const fetchInstallers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/installers');
      setInstallers(response.data);
    } catch (error) {
      console.error('Error fetching installers:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInstallers();
    setRefreshing(false);
  };

  const navigateToDetails = (installerId: string) => {
    router.push(`/(admin)/installer-details?id=${installerId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Instaladores</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          Gestión de instaladores y comisiones
        </Text>
      </View>

      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{installers.length}</Text>
            <Text style={styles.statLabel}>Total Instaladores</Text>
          </Card>
        </View>

        {/* Create Installer Button */}
        <Button
          title="+ Crear Nuevo Instalador"
          onPress={() => router.push('/(admin)/create-installer')}
          variant="gradient"
          gradient={['#7c3aed', '#a78bfa']}
          size="md"
          fullWidth
          style={styles.createButton}
        />

        {/* Installers List */}
        <FlatList
          data={installers}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigateToDetails(item.id)}
              activeOpacity={0.7}
            >
              <Card variant="elevated" style={styles.installerCard}>
                <View style={styles.installerHeader}>
                  <View style={styles.installerIcon}>
                    <Ionicons name="construct-outline" size={24} color="#7c3aed" />
                  </View>

                  <View style={styles.installerInfo}>
                    <Text style={styles.installerName}>{item.name}</Text>
                    <Text style={styles.installerEmail}>{item.email}</Text>
                    {item.phoneNumber && (
                      <View style={styles.phoneContainer}>
                        <Ionicons name="call-outline" size={14} color="#6b7280" />
                        <Text style={styles.installerPhone}>{item.phoneNumber}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.installerFooter}>
                  <View style={styles.installerMeta}>
                    <Badge label="INSTALLER" variant="info" size="sm" />
                    <Text style={styles.installerDate}>
                      Desde {formatDate(item.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.viewDetailsContainer}>
                    <Text style={styles.viewDetailsText}>Ver detalles</Text>
                    <Ionicons name="chevron-forward" size={16} color="#7c3aed" />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <Card variant="outlined" style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="construct-outline" size={64} color="#9ca3af" />
                </View>
                <Text style={styles.emptyText}>
                  No hay instaladores registrados
                </Text>
                <Text style={styles.emptySubtext}>
                  Los instaladores aparecerán aquí cuando sean creados
                </Text>
              </Card>
            ) : null
          }
        />

        {/* View Commissions Button */}
        <View style={styles.bottomActions}>
          <Button
            title="Ver Todas las Comisiones"
            onPress={() => router.push('/(admin)/commissions')}
            variant="gradient"
            gradient={['#7c3aed', '#a78bfa']}
            size="lg"
            fullWidth
          />
        </View>
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
  statsContainer: {
    marginBottom: Spacing.base,
  },
  statCard: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  createButton: {
    marginBottom: Spacing.base,
  },
  statValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  listContent: {
    paddingBottom: Spacing.xxxl + 60,
  },
  installerCard: {
    marginBottom: Spacing.md,
  },
  installerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  installerIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  installerInfo: {
    flex: 1,
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
    marginBottom: Spacing.xs / 2,
  },
  installerPhone: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  installerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
  },
  installerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  installerDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  viewDetailsText: {
    fontSize: Typography.fontSize.sm,
    color: '#7c3aed',
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyCard: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  emptyIconContainer: {
    marginBottom: Spacing.base,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
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
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
