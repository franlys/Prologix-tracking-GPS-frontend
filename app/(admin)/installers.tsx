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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Instaladores</Text>
        <Text style={styles.headerSubtitle}>
          Gestión de instaladores y comisiones
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{installers.length}</Text>
            <Text style={styles.statLabel}>Total Instaladores</Text>
          </Card>
        </View>

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
                    <Text style={styles.installerIconText}>🔧</Text>
                  </View>

                  <View style={styles.installerInfo}>
                    <Text style={styles.installerName}>{item.name}</Text>
                    <Text style={styles.installerEmail}>{item.email}</Text>
                    {item.phoneNumber && (
                      <Text style={styles.installerPhone}>
                        📞 {item.phoneNumber}
                      </Text>
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

                  <Text style={styles.viewDetailsText}>Ver detalles →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <Card variant="outlined" style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🔧</Text>
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
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'web' ? Spacing.xl : Spacing.xxxl,
    paddingBottom: Spacing.lg,
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
    padding: Spacing.base,
  },
  statsContainer: {
    marginBottom: Spacing.base,
  },
  statCard: {
    padding: Spacing.lg,
    alignItems: 'center',
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
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  installerIconText: {
    fontSize: 28,
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
  viewDetailsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyCard: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
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
