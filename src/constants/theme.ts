import '@/global.css';
import { Platform } from 'react-native';

/**
 * =========================================================================
 * ⚽ MODERN FOOTBALL SPORTS STORE - DESIGN SYSTEM TOKENS
 * =========================================================================
 */
export const FootballTheme = {
  colors: {
    // Primary Brand Palette
    background: '#F5FAFF',       // Crisp sport white-blue background
    card: '#FFFFFF',             // Clean card surface
    cardHover: '#F0F8FF',        // Subtle card hover
    primary: '#0B74DE',          // Electric Football Blue
    primaryHover: '#095EBE',     // Deep energetic blue
    primaryLight: '#D0E8FF',     // Soft primary accent
    sky: '#38BDF8',              // Dynamic Sky Blue
    lightBlue: '#E0F2FE',        // Sport jersey light blue
    darkNavy: '#0F172A',         // High-contrast Pitch Navy
    navyMuted: '#1E293B',        // Secondary navy
    white: '#FFFFFF',

    // Status Colors
    success: '#10B981',          // Pitch Grass Green
    successLight: '#ECFDF5',
    danger: '#EF4444',           // Referee Red Card
    dangerLight: '#FEF2F2',
    warning: '#F59E0B',          // Yellow Card
    warningLight: '#FFFBEB',

    // Text & Border
    text: '#0F172A',             // Dark Navy text
    textMuted: '#64748B',        // Subdued Slate
    textLight: '#94A3B8',        // Placeholder / secondary text
    border: '#E2E8F0',           // Modern border
    borderActive: '#38BDF8',     // Sky Blue highlight border
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadow: Platform.select({
    web: {
      sm: {
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
      },
      md: {
        boxShadow: '0 4px 12px rgba(11, 116, 222, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
      },
      lg: {
        boxShadow: '0 10px 25px rgba(11, 116, 222, 0.12), 0 4px 10px rgba(15, 23, 42, 0.05)',
      },
    },
    default: {
      sm: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      },
      md: {
        shadowColor: '#0B74DE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#0B74DE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 6,
      },
    },
  }) as any,
};

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F5FAFF',
    backgroundElement: '#E0F2FE',
    backgroundSelected: '#BAE6FD',
    textSecondary: '#64748B',
  },
  dark: {
    text: '#ffffff',
    background: '#0F172A',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'serif',
    rounded: 'system-ui, sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1240;
