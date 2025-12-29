/**
 * Theme Configuration for Prologix GPS Tracking
 * Professional color palette optimized for trust and technology
 * Inspired by the prompt: "Confianza & Tecnología"
 */

export const Colors = {
  // Primary Brand Colors - Deep Blue (Trust & Professionalism)
  primary: {
    50: '#e8f1f5',
    100: '#c5dce6',
    200: '#9fc5d6',
    300: '#78aec6',
    400: '#5b9cba',
    500: '#0B3C5D',  // Brand Deep Blue - Main color
    600: '#093650',
    700: '#072d43',
    800: '#052336',
    900: '#031a29',
  },

  // Secondary Colors - Light Blue (Interactive elements)
  secondary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#1F7AE0',  // Brand Light Blue
    600: '#1976d2',
    700: '#1565c0',
    800: '#0d47a1',
    900: '#0a3d91',
  },

  // Status Colors (Professional green for success)
  success: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#2ECC71',  // Success Green
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },

  successDark: '#1E8449', // Darker green for emphasis

  warning: '#f59e0b',   // Amber - Warning, Trial
  error: '#ef4444',     // Red - Offline, Error
  info: '#1F7AE0',      // Light Blue - Info

  // Neutral Colors (Light Mode) - Professional grays
  light: {
    background: '#F4F6F8',    // Light Gray - Clean background
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    text: '#2E2E2E',          // Dark Gray - High contrast
    textSecondary: '#6C757D', // Medium Gray - Secondary text
    textTertiary: '#94a3b8',  // Light Gray - Tertiary text
    border: '#e2e8f0',        // Slate 200
    borderLight: '#f1f5f9',   // Slate 100
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Dark Mode Colors
  dark: {
    background: '#0f172a',    // Slate 900
    surface: '#1e293b',       // Slate 800
    surfaceElevated: '#334155', // Slate 700
    text: '#f1f5f9',          // Slate 100
    textSecondary: '#cbd5e1', // Slate 300
    textTertiary: '#94a3b8',  // Slate 400
    border: '#334155',        // Slate 700
    borderLight: '#475569',   // Slate 600
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Plan Colors (Professional branding)
  plans: {
    free: {
      gradient: ['#6C757D', '#94a3b8'], // Gray
      color: '#6C757D',
    },
    basico: {
      gradient: ['#1F7AE0', '#0B3C5D'], // Blue gradient
      color: '#1F7AE0',
    },
    profesional: {
      gradient: ['#2ECC71', '#1E8449'], // Green gradient (most popular)
      color: '#2ECC71',
    },
    empresarial: {
      gradient: ['#0B3C5D', '#052336'], // Deep blue gradient (premium)
      color: '#0B3C5D',
    },
  },
};

export const Gradients = {
  primary: ['#0B3C5D', '#1F7AE0'], // Deep Blue to Light Blue
  success: ['#2ECC71', '#1E8449'], // Success Green gradient
  premium: ['#0B3C5D', '#052336'], // Deep Blue premium
  dark: ['#2E2E2E', '#0f172a'],
  light: ['#ffffff', '#F4F6F8'],

  // Plan gradients
  free: Colors.plans.free.gradient,
  basico: Colors.plans.basico.gradient,
  profesional: Colors.plans.profesional.gradient,
  empresarial: Colors.plans.empresarial.gradient,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
    display: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

// Helper to get current theme colors
export const getThemeColors = (isDark: boolean = false) => {
  return isDark ? Colors.dark : Colors.light;
};

export default {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
  Animation,
  getThemeColors,
};
