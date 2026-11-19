/**
 * Design system do CicloTECH — Dark Tech com azul neon elétrico.
 * Valores extraídos das variáveis CSS da aplicação Web (src/index.css):
 *   --primary  hsl(217 91% 60%) = #3B82F6
 *   --card     hsl(222 47% 7%)  ≈ #0B0F19
 *   --border   hsl(217 33% 17%) ≈ #1D283A
 */
export const colors = {
  background: '#030712',
  backgroundAlt: '#050814',
  surface: '#0B0F19',
  surfaceElevated: '#0D1322',
  surfaceMuted: '#111827',
  border: '#1D283A',
  borderStrong: '#1E293B',
  grid: 'rgba(59, 130, 246, 0.06)',

  primary: '#3B82F6',
  primaryPressed: '#2563EB',
  primarySoft: 'rgba(59, 130, 246, 0.14)',
  primaryBorder: 'rgba(59, 130, 246, 0.45)',
  accent: '#60A5FA',
  onPrimary: '#FFFFFF',

  text: '#FFFFFF',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  placeholder: '#475569',

  tabBar: '#090D16',
  tabInactive: '#64748B',

  success: '#22C55E',
  successSoft: 'rgba(34, 197, 94, 0.14)',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.12)',
} as const;

/** Mesmas famílias da Web: Space Grotesk (texto/títulos) e Geist Mono (rótulos técnicos). */
export const fonts = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
  monoBold: 'GeistMono_700Bold',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

// A Web usa --radius: 0.25rem (cantos retos, visual técnico); cards um pouco mais suaves no mobile.
export const radius = { sm: 4, md: 8, lg: 12, pill: 999 } as const;

/** Brilho azul neon (boxShadow é suportado no iOS, Android e Web pelo React Native atual). */
export const glow = {
  soft: '0px 0px 18px rgba(59, 130, 246, 0.25)',
  strong: '0px 0px 24px rgba(59, 130, 246, 0.55)',
} as const;
