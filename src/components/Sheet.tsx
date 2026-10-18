import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { radius, space } from '@/theme/tokens';
import { Icon, IconName } from './Icon';
import { ThemedText } from './ThemedText';

export type SheetAction = {
  label: string;
  icon?: IconName;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  actions: SheetAction[];
  onClose: () => void;
  cancelLabel: string;
};

/** Alttan açılan, native modal eylem sayfası. */
export function Sheet({ visible, title, actions, onClose, cancelLabel }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: theme.colors.surfaceRaised,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: theme.colors.border,
            paddingBottom: Math.max(insets.bottom, space.md),
            paddingTop: space.sm,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 36,
              height: 4,
              borderRadius: radius.pill,
              backgroundColor: theme.colors.borderStrong,
              marginBottom: space.sm,
            }}
          />
          <ThemedText
            variant="caption"
            tone="tertiary"
            style={{ paddingHorizontal: space.lg, marginBottom: space.xs, letterSpacing: 0.6 }}
          >
            {title}
          </ThemedText>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({ pressed }) => ({
                minHeight: 52,
                paddingHorizontal: space.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                backgroundColor: pressed ? theme.colors.surfaceSunken : 'transparent',
              })}
            >
              {action.icon ? (
                <Icon
                  name={action.icon}
                  size={22}
                  color={action.destructive ? theme.colors.danger : theme.colors.textSecondary}
                />
              ) : null}
              <ThemedText
                variant="body"
                weight="semibold"
                style={{ color: action.destructive ? theme.colors.danger : theme.colors.text }}
              >
                {action.label}
              </ThemedText>
            </Pressable>
          ))}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            style={({ pressed }) => ({
              minHeight: 52,
              marginTop: space.xs,
              marginHorizontal: space.md,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? theme.colors.surfaceSunken : 'transparent',
            })}
          >
            <ThemedText variant="body" weight="semibold" tone="secondary">
              {cancelLabel}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
