import React from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, space } from '@/theme/tokens';
import { Button } from './Button';
import { ThemedText } from './ThemedText';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

/** Yıkıcı eylemler için onay soran, native modal. Web alert kullanılmaz. */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = true,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(420, width - space.xxl);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        />
        <View
          accessibilityViewIsModal
          style={[
            {
              width: cardWidth,
              backgroundColor: theme.colors.surfaceRaised,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: space.lg,
              gap: space.sm,
            },
            theme.shadow.floating,
          ]}
        >
          <ThemedText variant="title" accessibilityRole="header">
            {title}
          </ThemedText>
          <ThemedText variant="body" tone="secondary">
            {body}
          </ThemedText>
          <View style={{ gap: space.xxs, marginTop: space.xs }}>
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'destructive' : 'primary'}
            />
            <Button label={cancelLabel} onPress={onCancel} variant="text" size="md" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
});
