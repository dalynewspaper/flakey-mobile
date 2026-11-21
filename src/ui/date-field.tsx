import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { formatLongDate, parseDateOnly, toDateOnly } from '@/lib/dates';

import { Text } from './index';

/**
 * Date input built on @expo/ui's native picker (SwiftUI on iOS, Compose on Android).
 * iOS renders a compact inline control; Android opens a dialog on tap.
 * Value and onChange use yyyy-MM-dd strings, matching the database columns.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
}: {
  label?: string;
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const t = useTheme();
  const scheme = useColorScheme();
  const [androidOpen, setAndroidOpen] = useState(false);
  const date = value ? parseDateOnly(value) : new Date();

  return (
    <View style={{ gap: Spacing.xs }}>
      {label ? <Text variant="label">{label}</Text> : null}
      {Platform.OS === 'ios' ? (
        <View
          style={{
            minHeight: 50,
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: t.border,
            backgroundColor: t.card,
            paddingHorizontal: Spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text muted={!value}>{value ? formatLongDate(date) : placeholder}</Text>
          {!disabled ? (
            <DateTimePicker
              value={date}
              mode="date"
              display="compact"
              themeVariant={scheme === 'dark' ? 'dark' : 'light'}
              onValueChange={(_e, d) => onChange(toDateOnly(d))}
            />
          ) : null}
        </View>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => setAndroidOpen(true)}
            style={{
              minHeight: 50,
              borderRadius: Radius.md,
              borderWidth: 1,
              borderColor: t.border,
              backgroundColor: t.card,
              paddingHorizontal: Spacing.lg,
              justifyContent: 'center',
              opacity: disabled ? 0.6 : 1,
            }}>
            <Text muted={!value}>{value ? formatLongDate(date) : placeholder}</Text>
          </Pressable>
          {androidOpen ? (
            <DateTimePicker
              value={date}
              mode="date"
              presentation="dialog"
              onValueChange={(_e, d) => {
                setAndroidOpen(false);
                onChange(toDateOnly(d));
              }}
              onDismiss={() => setAndroidOpen(false)}
            />
          ) : null}
        </>
      )}
    </View>
  );
}
