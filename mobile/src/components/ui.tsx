import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ───────────────────────── Fundo e estrutura ───────────────────────── */

const GRID = 32;

/** Grade sutil de fundo, como na Web. Não intercepta toques. */
export function GridBackground() {
  const { width, height } = useWindowDimensions();
  const colunas = Math.ceil(width / GRID);
  const linhas = Math.ceil(height / GRID);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: colunas }, (_, i) => (
        <View key={`c${i}`} style={[styles.gridLine, { left: i * GRID, top: 0, bottom: 0, width: 1 }]} />
      ))}
      {Array.from({ length: linhas }, (_, i) => (
        <View key={`l${i}`} style={[styles.gridLine, { top: i * GRID, left: 0, right: 0, height: 1 }]} />
      ))}
    </View>
  );
}

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Bordas protegidas pela safe area. Telas com header nativo não precisam de 'top'. */
  edges?: Edge[];
};

export function Screen({ children, style, edges = ['top', 'left', 'right'] }: ScreenProps) {
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      <GridBackground />
      <View style={[styles.screenContent, style]}>{children}</View>
    </SafeAreaView>
  );
}

/** Marca "CICLO TECH": CICLO em branco, TECH em azul neon. */
export function Brand({ size = 18, dot = true }: { size?: number; dot?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {dot && <View style={styles.brandDot} />}
      <Text style={[styles.brand, { fontSize: size }]}>
        CICLO<Text style={{ color: colors.primary }}>TECH</Text>
      </Text>
    </View>
  );
}

/** Barra superior das abas: marca à esquerda e ação à direita (como no protótipo mobile). */
export function AppHeader({ right }: { right?: ReactNode }) {
  return (
    <View style={styles.appHeader}>
      <Brand />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>{right}</View>
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'ghost',
}: {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'ghost' | 'primary';
}) {
  const primario = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        primario && { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={icon} size={18} color={primario ? colors.accent : colors.textSecondary} />
    </Pressable>
  );
}

/** Cabeçalho das telas internas (fora das abas): voltar + título, como "← ITEM DETAILS" do protótipo. */
export function StackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.stackHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text} />
      </Pressable>
      <Text style={styles.stackTitle} numberOfLines={1}>
        {title.toUpperCase()}
      </Text>
    </View>
  );
}

/** Botão de favoritar (coração) usado nos cards de doação e troca. */
export function FavoriteButton({ ativo, onPress, titulo }: { ativo: boolean; onPress: () => void; titulo: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ativo ? `Remover ${titulo} dos favoritos` : `Favoritar ${titulo}`}
      aria-pressed={ativo}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: 'rgba(3,7,18,0.75)' },
        ativo && { borderColor: colors.primaryBorder },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={ativo ? 'heart' : 'heart-outline'} size={18} color={ativo ? colors.accent : colors.textSecondary} />
    </Pressable>
  );
}

/* ───────────────────────── Tipografia ───────────────────────── */

/** Rótulo técnico em mono, caixa alta (ex.: "METRIC ANALYSIS"). */
export function Eyebrow({ children, color = colors.primary }: { children: ReactNode; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

/** Título de seção em caixa alta com o traço azul embaixo (padrão do protótipo). */
export function Title({ children, underline = true }: { children: ReactNode; underline?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.title}>{children}</Text>
      {underline && <View style={styles.titleBar} />}
    </View>
  );
}

export function Muted({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.muted, style]} />;
}

/* ───────────────────────── Botões ───────────────────────── */

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  size = 'md',
  style,
}: ButtonProps) {
  const inativo = disabled || loading;
  const corTexto =
    variant === 'primary'
      ? colors.onPrimary
      : variant === 'outline'
        ? colors.accent
        : variant === 'danger'
          ? colors.danger
          : colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inativo, busy: !!loading }}
      onPress={onPress}
      disabled={inativo}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        variant === 'primary' && [styles.buttonPrimary, pressed && { backgroundColor: colors.primaryPressed }],
        variant === 'secondary' && [styles.buttonSecondary, pressed && { borderColor: colors.primaryBorder }],
        variant === 'outline' && [styles.buttonOutline, pressed && { backgroundColor: colors.primarySoft }],
        variant === 'danger' && [styles.buttonDanger, pressed && { backgroundColor: colors.dangerSoft }],
        inativo && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 15 : 18} color={corTexto} />}
          <Text style={[styles.buttonText, size === 'sm' && { fontSize: 12 }, { color: corTexto }]}>
            {title.toUpperCase()}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/* ───────────────────────── Formulário ───────────────────────── */

type InputProps = TextInputProps & {
  label?: string;
  icon?: IconName;
  /** Texto à direita do rótulo (ex.: contador de caracteres). */
  hint?: string;
};

export function Input({ label, icon, hint, style, secureTextEntry, multiline, onFocus, onBlur, ...props }: InputProps) {
  const [focado, setFocado] = useState(false);
  const [oculto, setOculto] = useState(true);
  const senha = !!secureTextEntry;

  return (
    <View style={{ gap: 6 }}>
      {(label || hint) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
          {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
      )}
      <View
        style={[
          styles.inputBox,
          multiline && { alignItems: 'flex-start', paddingVertical: spacing.sm },
          focado && styles.inputBoxFocado,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focado ? colors.primary : colors.placeholder}
            style={multiline ? { marginTop: 4 } : undefined}
          />
        )}
        <TextInput
          accessibilityLabel={label ?? props.placeholder}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          secureTextEntry={senha && oculto}
          multiline={multiline}
          {...props}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && { minHeight: 110, textAlignVertical: 'top' }, style]}
        />
        {senha && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={oculto ? 'Mostrar senha' : 'Ocultar senha'}
            onPress={() => setOculto((v) => !v)}
            hitSlop={10}
          >
            <Ionicons name={oculto ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.checkboxRow}
    >
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
      </View>
      <Text style={[styles.muted, { flex: 1, color: colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

/* ───────────────────────── Superfícies ───────────────────────── */

export function Card({
  children,
  style,
  selected,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
}) {
  return <View style={[styles.card, selected && styles.cardSelected, style]}>{children}</View>;
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && !selected && { borderColor: colors.primaryBorder }]}
    >
      <Text style={[styles.chipText, selected && { color: colors.onPrimary }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

type BadgeTone = 'primary' | 'muted' | 'success' | 'warning' | 'danger';
const BADGE: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primarySoft, fg: colors.accent, border: colors.primaryBorder },
  muted: { bg: colors.surfaceMuted, fg: colors.textMuted, border: colors.border },
  success: { bg: colors.successSoft, fg: colors.success, border: 'rgba(34,197,94,0.4)' },
  warning: { bg: 'rgba(245,158,11,0.12)', fg: colors.warning, border: 'rgba(245,158,11,0.4)' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: 'rgba(239,68,68,0.4)' },
};

export function Badge({ label, tone = 'primary', dot }: { label: string; tone?: BadgeTone; dot?: boolean }) {
  const t = BADGE[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}>
      {dot && <View style={[styles.badgeDot, { backgroundColor: t.fg }]} />}
      <Text style={[styles.badgeText, { color: t.fg }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

/** Mensagem dentro do formulário (erro ou sucesso), no lugar de toasts/alerts. */
export function Feedback({ tipo, mensagem }: { tipo: 'erro' | 'sucesso'; mensagem: string }) {
  const erro = tipo === 'erro';
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.feedback,
        erro
          ? { backgroundColor: colors.dangerSoft, borderColor: 'rgba(239,68,68,0.4)' }
          : { backgroundColor: colors.successSoft, borderColor: 'rgba(34,197,94,0.4)' },
      ]}
    >
      <Ionicons
        name={erro ? 'alert-circle-outline' : 'checkmark-circle-outline'}
        size={18}
        color={erro ? colors.danger : colors.success}
      />
      <Text style={[styles.muted, { flex: 1, color: colors.textSecondary }]}>{mensagem}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title.toUpperCase()}</Text>
      <Muted style={{ textAlign: 'center' }}>{text}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  gridLine: { position: 'absolute', backgroundColor: colors.grid },
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { flex: 1 },

  brandDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, boxShadow: glow.strong },
  brand: { color: colors.text, fontFamily: fonts.bold, letterSpacing: 1.5 },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  stackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
  },
  stackTitle: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 17, letterSpacing: 1 },

  eyebrow: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 2 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 28, letterSpacing: 0.5, textTransform: 'uppercase' },
  titleBar: { width: 44, height: 3, borderRadius: 2, backgroundColor: colors.primary, boxShadow: glow.strong },
  muted: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },

  button: {
    minHeight: 50,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonSm: { minHeight: 40 },
  buttonPrimary: { backgroundColor: colors.primary, borderColor: colors.primary, boxShadow: glow.soft },
  buttonSecondary: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  buttonOutline: { backgroundColor: 'transparent', borderColor: colors.primaryBorder },
  buttonDanger: { backgroundColor: 'transparent', borderColor: 'rgba(239,68,68,0.35)' },
  buttonText: { fontFamily: fonts.monoBold, fontSize: 13, letterSpacing: 1.8 },

  label: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.6 },
  hint: { color: colors.placeholder, fontFamily: fonts.mono, fontSize: 11 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  inputBoxFocado: { borderColor: colors.primary, boxShadow: glow.soft },
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15, paddingVertical: 12 },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardSelected: { borderColor: colors.primary, boxShadow: glow.strong },

  chip: {
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary, boxShadow: glow.soft },
  chipText: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.2 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.2 },

  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: spacing.xs,
  },
  emptyTitle: { color: colors.text, fontFamily: fonts.monoBold, fontSize: 13, letterSpacing: 1.5 },
});
