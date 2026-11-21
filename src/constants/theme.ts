/**
 * Flakey "Paper & Ink" design tokens, mirrored from the web app's index.css.
 * canvas #f5f3ee, surface #e8e4dd, ink #2d2d2d, deep ink #0d0d0d,
 * accent #ff3b00 (used as a single dot, never as a fill).
 */

export const Colors = {
  light: {
    background: '#F5F3EE',
    card: '#FFFFFF',
    surface: '#E8E4DD',
    text: '#2D2D2D',
    textStrong: '#0D0D0D',
    textMuted: '#666666',
    border: '#D9D3C9',
    primary: '#0D0D0D',
    onPrimary: '#F5F3EE',
    accent: '#FF3B00',
    danger: '#B8401A',
    success: '#357A57',
  },
  dark: {
    background: '#0D0D0D',
    card: '#1A1A1A',
    surface: '#242424',
    text: '#F5F3EE',
    textStrong: '#FFFFFF',
    textMuted: '#ADA69B',
    border: '#2E2E2E',
    primary: '#F5F3EE',
    onPrimary: '#0D0D0D',
    accent: '#FF5A26',
    danger: '#E0673F',
    success: '#5BAE82',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

export const Fonts = {
  display: 'Outfit_600SemiBold',
  displayBold: 'Outfit_700Bold',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemiBold: 'Figtree_600SemiBold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;
