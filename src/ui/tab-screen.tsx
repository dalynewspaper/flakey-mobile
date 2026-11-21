import type { ReactNode } from 'react';
import { RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Screen, Text } from './index';

/** Top-level tab screen: large editorial title, pull to refresh, safe-area aware. */
export function TabScreen({
  title,
  eyebrow,
  action,
  refreshing,
  onRefresh,
  children,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  return (
    <Screen
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingTop: insets.top + Spacing.lg }}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.textMuted} /> : undefined}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.md }}>
        <View style={{ flex: 1, gap: Spacing.xs }}>
          {eyebrow ? (
            <Text variant="eyebrow" muted>
              {eyebrow}
            </Text>
          ) : null}
          <Text variant="hero" accessibilityRole="header">
            {title}
          </Text>
        </View>
        {action}
      </View>
      {children}
    </Screen>
  );
}
