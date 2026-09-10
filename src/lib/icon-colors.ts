import { useColorScheme } from 'react-native';

const ICON_COLORS = {
  light: {
    foreground: '#0a0a0a',
    mutedForeground: '#737373',
    primary: '#171717',
    primaryForeground: '#fafafa',
    destructive: '#ef4444',
  },
  dark: {
    foreground: '#fafafa',
    mutedForeground: '#a3a3a3',
    primary: '#fafafa',
    primaryForeground: '#171717',
    destructive: '#f87171',
  },
} as const;

export type IconColorKey = keyof typeof ICON_COLORS.light;

export function useIconColor(key: IconColorKey = 'foreground'): string {
  const scheme = useColorScheme();
  return ICON_COLORS[scheme === 'dark' ? 'dark' : 'light'][key];
}
