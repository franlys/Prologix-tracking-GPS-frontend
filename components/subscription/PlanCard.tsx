import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../constants/Theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface PlanFeature {
  name: string;
  included: boolean;
  value?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  currency: string;
  gradient: string[];
  recommended?: boolean;
  features: PlanFeature[];
  maxDevices: number;
  maxGeofences: number;
  maxSharedUsers?: number;
}

interface PlanCardProps {
  plan: Plan;
  currentPlan?: string;
  onSelect: (plan: Plan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, currentPlan, onSelect }) => {
  const isCurrentPlan = currentPlan?.toUpperCase() === plan.name.toUpperCase();
  const isFree = plan.price === 0;

  return (
    <View style={[styles.container, plan.recommended && styles.recommended]}>
      {plan.recommended && (
        <View style={styles.recommendedBadge}>
          <Badge label="⭐ Recomendado" variant="premium" />
        </View>
      )}

      <LinearGradient
        colors={plan.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.description}>{plan.description}</Text>

        <View style={styles.priceContainer}>
          {isFree ? (
            <Text style={styles.freeText}>Gratis</Text>
          ) : (
            <>
              <Text style={styles.currency}>{plan.currency}</Text>
              <Text style={styles.price}>{plan.price.toFixed(2)}</Text>
              <Text style={styles.period}>
                /{plan.billingPeriod === 'MONTHLY' ? 'mes' : 'año'}
              </Text>
            </>
          )}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.limits}>
          <View style={styles.limitRow}>
            <Text style={styles.limitIcon}>📱</Text>
            <Text style={styles.limitText}>
              Hasta {plan.maxDevices} dispositivo{plan.maxDevices > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.limitRow}>
            <Text style={styles.limitIcon}>📍</Text>
            <Text style={styles.limitText}>
              Hasta {plan.maxGeofences} geofence{plan.maxGeofences > 1 ? 's' : ''}
            </Text>
          </View>

          {plan.maxSharedUsers && plan.maxSharedUsers > 0 && (
            <View style={styles.limitRow}>
              <Text style={styles.limitIcon}>👥</Text>
              <Text style={styles.limitText}>
                Hasta {plan.maxSharedUsers} usuario{plan.maxSharedUsers > 1 ? 's' : ''} compartido
                {plan.maxSharedUsers > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.features}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.included ? '✅' : '❌'}</Text>
              <Text style={[styles.featureText, !feature.included && styles.featureDisabled]}>
                {feature.name}
                {feature.value && ` (${feature.value})`}
              </Text>
            </View>
          ))}
        </View>

        <Button
          title={isCurrentPlan ? 'Plan Actual' : isFree ? 'Comenzar Gratis' : 'Seleccionar Plan'}
          onPress={() => onSelect(plan)}
          variant={isCurrentPlan ? 'outline' : 'gradient'}
          gradient={plan.gradient}
          fullWidth
          disabled={isCurrentPlan}
          style={styles.selectButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.light.surface,
    ...Shadows.lg,
    marginBottom: Spacing.lg,
  },
  recommended: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  recommendedBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  planName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.lg,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  freeText: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  currency: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: '#ffffff',
    marginRight: Spacing.xs / 2,
  },
  price: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  period: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: Spacing.xs,
  },
  body: {
    padding: Spacing.lg,
  },
  limits: {
    marginBottom: Spacing.base,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  limitIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  limitText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.base,
  },
  features: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  featureDisabled: {
    color: Colors.light.textTertiary,
    textDecorationLine: 'line-through',
  },
  selectButton: {
    marginTop: Spacing.sm,
  },
});

export default PlanCard;
