import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../context/ctx';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  route: string;
  bgColor: string;
  iconColor: string;
}

const ADMIN_ACTIONS: QuickAction[] = [
  {
    id: 'device-setup',
    title: 'Configurar GPS',
    icon: 'settings-outline',
    description: 'Wizard paso a paso para configurar nuevos dispositivos GPS',
    route: '/(admin)/device-setup',
    bgColor: '#10b981',
    iconColor: '#ffffff',
  },
  {
    id: 'link-device',
    title: 'Vincular Dispositivo',
    icon: 'link-outline',
    description: 'Asignar dispositivos GPS a usuarios',
    route: '/(admin)/link-device',
    bgColor: '#3b82f6',
    iconColor: '#ffffff',
  },
  {
    id: 'installers',
    title: 'Instaladores',
    icon: 'construct-outline',
    description: 'Gestionar instaladores y sus comisiones',
    route: '/(admin)/installers',
    bgColor: '#7c3aed',
    iconColor: '#ffffff',
  },
  {
    id: 'users',
    title: 'Usuarios',
    icon: 'people-outline',
    description: 'Gestionar todos los usuarios del sistema',
    route: '/(admin)/users',
    bgColor: '#f59e0b',
    iconColor: '#ffffff',
  },
  {
    id: 'commissions',
    title: 'Comisiones',
    icon: 'cash-outline',
    description: 'Ver reporte de comisiones pagadas',
    route: '/(admin)/commissions',
    bgColor: '#ec4899',
    iconColor: '#ffffff',
  },
  {
    id: 'devices-all',
    title: 'Todos los GPS',
    icon: 'map-outline',
    description: 'Ver todos los dispositivos del sistema',
    route: '/(tabs)/devices',
    bgColor: '#06b6d4',
    iconColor: '#ffffff',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const [stats, setStats] = useState({ gpsCount: 0, usersCount: 0, installersCount: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [gpsRes, usersRes, installersRes] = await Promise.all([
        api.get('/admin/devices').catch(() => ({ data: [] })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/installers').catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const actualUsers = users.filter((u: any) => u.role === 'USER');

      setStats({
        gpsCount: gpsRes.data?.length || 0,
        usersCount: actualUsers.length,
        installersCount: installersRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Panel de Administración</Text>
            <Text style={styles.headerSubtitle}>
              Bienvenido, {user?.name || 'Admin'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="hardware-chip-outline" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{stats.gpsCount}</Text>
            <Text style={styles.statLabel}>GPS Activos</Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="people-outline" size={24} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{stats.usersCount}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="construct-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{stats.installersCount}</Text>
            <Text style={styles.statLabel}>Instaladores</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Ionicons name="flash-outline" size={20} color="#374151" />
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        </View>

        <View style={styles.actionsGrid}>
          {ADMIN_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.7}
              onPress={() => router.push(action.route as any)}
              style={styles.actionCardWrapper}
            >
              <Card variant="elevated" style={styles.actionCard}>
                <View style={[styles.actionIconContainer, { backgroundColor: action.bgColor }]}>
                  <Ionicons name={action.icon} size={28} color={action.iconColor} />
                </View>

                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription} numberOfLines={2}>
                    {action.description}
                  </Text>
                </View>

                <View style={styles.actionFooter}>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* System Info */}
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={20} color="#374151" />
          <Text style={styles.sectionTitle}>Información del Sistema</Text>
        </View>

        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={styles.infoValue}>Operacional</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="code-outline" size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Versión</Text>
              <Text style={styles.infoValue}>1.3.0</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="server-outline" size={20} color="#7c3aed" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Plataforma GPS</Text>
              <Text style={styles.infoValue}>GPS-Trace + Traccar</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-circle-outline" size={20} color="#f59e0b" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Rol</Text>
              <Text style={styles.infoValue}>Administrador</Text>
            </View>
          </View>
        </Card>

        {/* Help Card */}
        <View style={styles.sectionHeader}>
          <Ionicons name="help-circle-outline" size={20} color="#374151" />
          <Text style={styles.sectionTitle}>Guía Rápida</Text>
        </View>

        <Card variant="outlined" style={styles.helpCard}>
          <View style={styles.helpStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.helpStepText}>
              Configura el GPS nuevo (Configurar GPS)
            </Text>
          </View>

          <View style={styles.helpStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.helpStepText}>
              Vincula el GPS a un usuario (Vincular Dispositivo)
            </Text>
          </View>

          <View style={styles.helpStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.helpStepText}>
              El usuario puede ver su GPS en la app móvil
            </Text>
          </View>

          <View style={styles.helpStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.helpStepText}>
              El instalador recibe su comisión automáticamente
            </Text>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prologix GPS Tracking System © 2026
          </Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
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
  logoutButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.md,
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    alignSelf: 'center',
    width: '100%',
  },
  statCard: {
    flex: 1,
    padding: Spacing.base,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#374151',
    marginLeft: Spacing.sm,
  },
  actionsGrid: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    alignSelf: 'center',
    width: '100%',
  },
  actionCardWrapper: {
    marginBottom: Spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: Spacing.base,
  },
  actionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  actionDescription: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    lineHeight: 18,
  },
  actionFooter: {
    marginLeft: Spacing.sm,
  },
  infoCard: {
    marginHorizontal: Spacing.base,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    alignSelf: 'center',
    width: Platform.OS === 'web' ? 'calc(100% - 32px)' : undefined,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    minHeight: 50,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoContent: {
    marginLeft: Spacing.md,
    flex: 1,
    flexShrink: 1,
  },
  infoLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#9ca3af',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#1f2937',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: Spacing.md,
  },
  helpCard: {
    marginHorizontal: Spacing.base,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    alignSelf: 'center',
    width: Platform.OS === 'web' ? 'calc(100% - 32px)' : undefined,
  },
  helpStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 32,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  helpStepText: {
    flex: 1,
    flexShrink: 1,
    fontSize: Typography.fontSize.sm,
    color: '#065f46',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    color: '#9ca3af',
  },
});
