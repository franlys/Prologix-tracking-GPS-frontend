import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSession } from '../../context/ctx';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  color: string;
  gradient: [string, string];
}

const ADMIN_ACTIONS: QuickAction[] = [
  {
    id: 'device-setup',
    title: 'Configurar GPS',
    icon: '📱',
    description: 'Wizard paso a paso para configurar nuevos dispositivos GPS',
    route: '/(admin)/device-setup',
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
  },
  {
    id: 'link-device',
    title: 'Vincular Dispositivo',
    icon: '🔗',
    description: 'Asignar dispositivos GPS a usuarios',
    route: '/(admin)/link-device',
    color: '#3b82f6',
    gradient: ['#3b82f6', '#2563eb'],
  },
  {
    id: 'installers',
    title: 'Instaladores',
    icon: '🔧',
    description: 'Gestionar instaladores y sus comisiones',
    route: '/(admin)/installers',
    color: '#7c3aed',
    gradient: ['#7c3aed', '#a78bfa'],
  },
  {
    id: 'users',
    title: 'Usuarios',
    icon: '👥',
    description: 'Gestionar todos los usuarios del sistema',
    route: '/(admin)/users',
    color: '#f59e0b',
    gradient: ['#f59e0b', '#fbbf24'],
  },
  {
    id: 'commissions',
    title: 'Comisiones',
    icon: '💰',
    description: 'Ver reporte de comisiones pagadas',
    route: '/(admin)/commissions',
    color: '#ec4899',
    gradient: ['#ec4899', '#f472b6'],
  },
  {
    id: 'devices-all',
    title: 'Todos los GPS',
    icon: '🗺️',
    description: 'Ver todos los dispositivos del sistema',
    route: '/(tabs)/devices',
    color: '#06b6d4',
    gradient: ['#06b6d4', '#22d3ee'],
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useSession();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7c3aed', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <Text style={styles.headerSubtitle}>Bienvenido, {user?.name || 'Admin'}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <Card variant="elevated" style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🎯 Acciones Rápidas</Text>
          <Text style={styles.welcomeText}>
            Selecciona una opción para gestionar el sistema Prologix GPS
          </Text>
        </Card>

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {ADMIN_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.7}
              onPress={() => router.push(action.route as any)}
              style={styles.actionCardWrapper}
            >
              <Card variant="elevated" style={styles.actionCard}>
                <LinearGradient
                  colors={action.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </LinearGradient>

                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>

                <View style={styles.actionFooter}>
                  <Text style={styles.actionCTA}>Abrir →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* System Info */}
        <Card variant="outlined" style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Sistema Prologix GPS</Text>
          <Text style={styles.infoText}>
            • Versión: 1.3.0{'\n'}
            • Estado: Operacional{'\n'}
            • Plataforma GPS: GPS-Trace + Traccar{'\n'}
            • Rol: Administrador
          </Text>
        </Card>

        {/* Help Card */}
        <Card variant="outlined" style={styles.helpCard}>
          <Text style={styles.helpTitle}>💡 Flujo de Trabajo Recomendado</Text>
          <Text style={styles.helpText}>
            1. Configura el GPS nuevo (Configurar GPS){'\n'}
            2. Vincula el GPS a un usuario (Vincular Dispositivo){'\n'}
            3. El usuario puede ver su GPS en la app{'\n'}
            4. El instalador recibe su comisión automáticamente
          </Text>
        </Card>

        {/* Logout Button */}
        <Button
          title="Cerrar Sesión"
          onPress={() => {
            router.replace('/(auth)/login');
          }}
          variant="outline"
          size="md"
          fullWidth
          style={styles.logoutButton}
        />

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
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'web' ? Spacing.xl : Spacing.xxxl,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  welcomeCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
    marginBottom: Spacing.lg,
  },
  actionCardWrapper: {
    width: Platform.OS === 'web' ? 'calc(50% - 8px)' : '48%',
    minWidth: 160,
  },
  actionCard: {
    overflow: 'hidden',
  },
  actionGradient: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 40,
  },
  actionContent: {
    padding: Spacing.base,
    minHeight: 80,
  },
  actionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  actionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  actionFooter: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  actionCTA: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary['500'],
  },
  infoCard: {
    padding: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#1e40af',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  helpCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  helpTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#065f46',
    marginBottom: Spacing.sm,
  },
  helpText: {
    fontSize: Typography.fontSize.sm,
    color: '#064e3b',
    lineHeight: 20,
  },
  logoutButton: {
    marginBottom: Spacing.xl,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textTertiary,
  },
});
