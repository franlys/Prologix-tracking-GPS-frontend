/**
 * Theme Configuration for Prologix GPS Tracking
 * Inspired by modern GPS tracking apps with clean, professional design
 */

export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Accent Colors (Violet/Purple for premium features)
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Status Colors
  success: '#10b981',   // Green - Online, Active
  warning: '#f59e0b',   // Amber - Warning, Trial
  error: '#ef4444',     // Red - Offline, Error
  info: '#06b6d4',      // Cyan - Info

  // Neutral Colors (Light Mode)
  light: {
    background: '#f8fafc',    // Slate 50
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    text: '#1e293b',          // Slate 800
    textSecondary: '#64748b', // Slate 500
    textTertiary: '#94a3b8',  // Slate 400
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

  // Plan Colors
  plans: {
    free: {
      gradient: ['#94a3b8', '#64748b'],
      color: '#64748b',
    },
    basico: {
      gradient: ['#3b82f6', '#2563eb'],
      color: '#3b82f6',
    },
    profesional: {
      gradient: ['#8b5cf6', '#7c3aed'],
      color: '#8b5cf6',
    },
    empresarial: {
      gradient: ['#f59e0b', '#ea580c'],
      color: '#f59e0b',
    },
  },
};

export const Gradients = {
  primary: ['#3b82f6', '#8b5cf6'],
  success: ['#10b981', '#06b6d4'],
  premium: ['#f59e0b', '#ef4444'],
  dark: ['#1e293b', '#0f172a'],
  light: ['#ffffff', '#f8fafc'],

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
