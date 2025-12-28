import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Button } from '../../components/ui/Button';
import { CompassLoader } from '../../components/ui/CompassLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    icon: '🧭',
    title: '¡Bienvenido a Prologix GPS!',
    description: 'La plataforma más completa para rastreo GPS en tiempo real',
    gradient: ['#3b82f6', '#8b5cf6'],
  },
  {
    id: 2,
    icon: '📍',
    title: 'Rastreo en Tiempo Real',
    description: 'Monitorea la ubicación exacta de tus dispositivos GPS 24/7 desde cualquier lugar',
    gradient: ['#10b981', '#06b6d4'],
  },
  {
    id: 3,
    icon: '🔔',
    title: 'Alertas Inteligentes',
    description: 'Recibe notificaciones instantáneas por WhatsApp, Email y Push cuando lo necesites',
    gradient: ['#f59e0b', '#ef4444'],
  },
  {
    id: 4,
    icon: '📊',
    title: 'Reportes Detallados',
    description: 'Consulta historial de rutas, velocidades y estadísticas completas',
    gradient: ['#8b5cf6', '#ec4899'],
  },
  {
    id: 5,
    icon: '🗺️',
    title: 'Geofences (Zonas Seguras)',
    description: 'Define zonas seguras y recibe alertas cuando tus dispositivos entren o salgan',
    gradient: ['#06b6d4', '#3b82f6'],
  },
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Completed onboarding
      router.replace('/(tabs)/dashboard' as any);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/dashboard' as any);
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={slide.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          {currentSlide > 0 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Saltar</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={currentSlide}
            entering={FadeInRight.duration(400)}
            exiting={FadeOutLeft.duration(200)}
            style={styles.slideContent}
          >
            {/* Icon or Compass */}
            <View style={styles.iconContainer}>
              {currentSlide === 0 ? (
                <CompassLoader size={140} />
              ) : (
                <Text style={styles.slideIcon}>{slide.icon}</Text>
              )}
            </View>

            {/* Title */}
            <Text style={styles.slideTitle}>{slide.title}</Text>

            {/* Description */}
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </Animated.View>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Next Steps (on last slide) */}
          {currentSlide === slides.length - 1 && (
            <View style={styles.nextStepsCard}>
              <Text style={styles.nextStepsTitle}>🚀 Próximos Pasos</Text>
              <View style={styles.stepsList}>
                <View style={styles.step}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepText}>Contacta a tu instalador</Text>
                </View>
                <View style={styles.step}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepText}>Instalador vincula tus dispositivos GPS</Text>
                </View>
                <View style={styles.step}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepText}>¡Empieza a rastrear en tiempo real!</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Button */}
          <Button
            title={currentSlide === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
            onPress={handleNext}
            variant="secondary"
            size="lg"
            fullWidth
            style={styles.actionButton}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  skipText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    justifyContent: 'center',
  },
  slideContent: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  slideIcon: {
    fontSize: 120,
  },
  slideTitle: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  slideDescription: {
    fontSize: Typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: Spacing.base,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  nextStepsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  nextStepsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.md,
  },
  stepsList: {
    gap: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#ffffff',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 32,
    marginRight: Spacing.md,
  },
  stepText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: Typography.fontWeight.medium,
  },
  actionButton: {
    marginTop: Spacing.base,
  },
});
