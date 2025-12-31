import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/Theme';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  route: string;
  color?: string;
}

const defaultActions: QuickAction[] = [
  { id: '1', title: 'Mapa', icon: '🗺️', route: '/(tabs)/map', color: Colors.primary['500'] },
  { id: '2', title: 'Dispositivos', icon: '📱', route: '/(tabs)/devices', color: Colors.secondary['500'] },
  { id: '3', title: 'Planes', icon: '💎', route: '/(tabs)/subscription', color: '#f59e0b' },
  { id: '4', title: 'Alertas', icon: '🔔', route: '/(tabs)/map', color: Colors.error },
];

interface QuickActionsProps {
  actions?: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions = defaultActions }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accesos Rápidos</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.action, { borderColor: action.color || Colors.primary['500'] }]}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  grid: {
    gap: Spacing.md,
  },
  action: {
    width: 100,
    aspectRatio: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  actionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    textAlign: 'center',
  },
});

export default QuickActions;
