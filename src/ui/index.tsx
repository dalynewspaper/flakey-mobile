import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextProps as RNTextProps,
  type ViewStyle,
} from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPersonInitial, resolveAvatarUri, type PersonNameFields } from '@/lib/people';

// ---------- Text ----------

type TextVariant = 'hero' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'eyebrow';

export function Text({
  variant = 'body',
  muted,
  style,
  ...rest
}: RNTextProps & { variant?: TextVariant; muted?: boolean }) {
  const t = useTheme();
  const color = muted ? t.textMuted : variant === 'hero' || variant === 'title' ? t.textStrong : t.text;
  return <RNText style={[textStyles[variant], { color }, style]} {...rest} />;
}

const textStyles = StyleSheet.create({
  hero: { fontFamily: Fonts.displayBold, fontSize: 34, lineHeight: 38, letterSpacing: -0.8 },
  title: { fontFamily: Fonts.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  heading: { fontFamily: Fonts.display, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: Fonts.bodySemiBold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: Fonts.bodySemiBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.6, textTransform: 'uppercase' },
});

// ---------- Layout ----------

/** Scrollable screen body on the paper canvas. Native headers handle the top inset. */
export function Screen({ children, contentContainerStyle, ...rest }: ScrollViewProps & { children: ReactNode }) {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentContainerStyle={[{ padding: Spacing.lg, paddingBottom: Spacing.xxl * 2, gap: Spacing.lg }, contentContainerStyle]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      {...rest}>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, tone = 'card' }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'card' | 'surface' | 'ink' }) {
  const t = useTheme();
  const bg = tone === 'ink' ? t.primary : tone === 'surface' ? t.surface : t.card;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: Radius.lg,
          borderWidth: tone === 'card' ? StyleSheet.hairlineWidth : 0,
          borderColor: t.border,
          padding: Spacing.lg,
          gap: Spacing.sm,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

/** Eyebrow label with Flakey's single signal-red dot. */
export function SectionLabel({ children, action }: { children: string; action?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.accent }} />
        <Text variant="eyebrow" muted>
          {children}
        </Text>
      </View>
      {action}
    </View>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card tone="surface" style={{ alignItems: 'flex-start', gap: Spacing.md, paddingVertical: Spacing.xl }}>
      <Text variant="heading">{title}</Text>
      <Text muted>{body}</Text>
      {action}
    </Card>
  );
}

export function Loading() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.background, padding: Spacing.xl }}>
      <ActivityIndicator color={t.textMuted} />
    </View>
  );
}

export function ErrorNotice({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <EmptyState
      title="Couldn't load this"
      body={message}
      action={onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} /> : undefined}
    />
  );
}

// ---------- Controls ----------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  onPress,
  style,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.primary : variant === 'secondary' ? t.surface : 'transparent';
  const fg = variant === 'primary' ? t.onPrimary : variant === 'danger' ? t.danger : t.textStrong;
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={(e) => {
        if (Platform.OS === 'ios') Haptics.selectionAsync();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        {
          minHeight: 50,
          borderRadius: Radius.pill,
          paddingHorizontal: Spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          opacity: isDisabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...rest}>
      {loading ? <ActivityIndicator color={fg} /> : <Text variant="label" style={{ color: fg }}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, hint, error, style, ...rest }: TextInputProps & { label?: string; hint?: string; error?: string | null }) {
  const t = useTheme();
  return (
    <View style={{ gap: Spacing.xs }}>
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        placeholderTextColor={t.textMuted}
        style={[
          {
            minHeight: 50,
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: error ? t.danger : t.border,
            backgroundColor: t.card,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            fontFamily: Fonts.body,
            fontSize: 16,
            color: t.textStrong,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" style={{ color: t.danger }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" muted>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 40,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radius.pill,
        justifyContent: 'center',
        backgroundColor: selected ? t.primary : t.card,
        borderWidth: 1,
        borderColor: selected ? t.primary : t.border,
        opacity: pressed ? 0.8 : 1,
      })}>
      <Text variant="label" style={{ color: selected ? t.onPrimary : t.text, fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>{children}</View>;
}

/** Tappable list row used in People and Dates. */
export function Row({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
}: {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.md,
        minHeight: 56,
        opacity: pressed ? 0.6 : 1,
      })}>
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="label" numberOfLines={1} style={{ color: t.textStrong }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

export function Divider() {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border }} />;
}

export function Avatar({ person, size = 44 }: { person: PersonNameFields & { avatar_url?: string | null }; size?: number }) {
  const t = useTheme();
  const uri = resolveAvatarUri(person.avatar_url);
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={[shape, { backgroundColor: t.surface }]} contentFit="cover" transition={150} />;
  }
  return (
    <View style={[shape, { backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ fontFamily: Fonts.display, fontSize: size * 0.4, color: t.textStrong }}>{getPersonInitial(person)}</Text>
    </View>
  );
}

/** Small pill showing days until a date, e.g. "Tomorrow" / "In 5 days". */
export function DaysBadge({ days, label }: { days: number; label: string }) {
  const t = useTheme();
  const soon = days <= 7;
  return (
    <View
      style={{
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: Radius.pill,
        backgroundColor: soon ? t.primary : t.surface,
      }}>
      <Text variant="caption" style={{ fontFamily: Fonts.bodySemiBold, color: soon ? t.onPrimary : t.text }}>
        {label}
      </Text>
    </View>
  );
}

/** Round ink "+" button used beside screen titles. */
export function AddButton({ onPress, label }: { onPress: () => void; label: string }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: Radius.pill,
        backgroundColor: t.primary,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}>
      <Text style={{ color: t.onPrimary, fontSize: 26, lineHeight: 28 }}>+</Text>
    </Pressable>
  );
}
