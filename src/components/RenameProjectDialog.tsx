import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { fontFamily, radius, space, type } from '@/theme/tokens';
import { Button } from './Button';
import { ThemedText } from './ThemedText';

type Props = {
  visible: boolean;
  initialValue: string;
  onCancel: () => void;
  onSave: (title: string) => void;
};

const MAX_LENGTH = 60;

export function RenameProjectDialog({ visible, initialValue, onCancel, onSave }: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const trimmed = value.trim();
  const canSave = trimmed.length > 0;
  const cardWidth = Math.min(420, width - space.xxl);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t.common.cancel}
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
            {t.projects.renameTitle}
          </ThemedText>

          <View style={{ gap: 6 }}>
            <ThemedText variant="caption" tone="secondary">
              {t.projects.renameLabel}
            </ThemedText>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={t.projects.renamePlaceholder}
              placeholderTextColor={theme.colors.textTertiary}
              autoFocus
              maxLength={MAX_LENGTH}
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={() => canSave && onSave(trimmed)}
              accessibilityLabel={t.projects.renameLabel}
              style={{
                minHeight: 48,
                borderWidth: 1,
                borderColor: theme.colors.borderStrong,
                backgroundColor: theme.colors.inputBg,
                borderRadius: radius.md,
                paddingHorizontal: space.sm,
                paddingVertical: space.xs,
                color: theme.colors.text,
                fontFamily,
                ...type.body,
              }}
            />
            <ThemedText variant="caption" tone="tertiary" style={{ textAlign: 'right' }} numeric>
              {`${value.length}/${MAX_LENGTH}`}
            </ThemedText>
          </View>

          <View style={{ gap: space.xxs, marginTop: space.xs }}>
            <Button
              label={t.common.save}
              onPress={() => canSave && onSave(trimmed)}
              disabled={!canSave}
            />
            <Button label={t.common.cancel} onPress={onCancel} variant="text" size="md" />
          </View>
        </View>
      </KeyboardAvoidingView>
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
