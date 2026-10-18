import React, { useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { absoluteFill, radius, space } from '@/theme/tokens';
import { formatClock } from '@/utils/format';
import { ThemedText } from './ThemedText';
import { VideoThumb } from './VideoThumb';

const TRACK_HEIGHT = 56;
const HANDLE_HIT = 44;
const HANDLE_WIDTH = 22;
const HANDLE_HEIGHT = 48;

type Props = {
  uri?: string;
  duration: number;
  start: number;
  end: number;
  minGap?: number;
  startLabel: string;
  endLabel: string;
  onChange: (start: number, end: number) => void;
  onCommit?: () => void;
  incrementLabel: string;
  decrementLabel: string;
  disabled?: boolean;
};

function snap(value: number, duration: number): number {
  const clamped = Math.min(Math.max(0, value), duration);
  return Math.round(clamped * 10) / 10;
}

/**
 * Çift tutamaçlı kırpma çubuğu. Dokunma hedefi 44 pt, a11y için adjustable rolü
 * ve 1 saniyelik artır/azalt eylemleri vardır.
 */
export function TrimBar({
  uri,
  duration,
  start,
  end,
  minGap = 0.5,
  startLabel,
  endLabel,
  onChange,
  onCommit,
  incrementLabel,
  decrementLabel,
  disabled = false,
}: Props) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const live = useRef({
    start,
    end,
    duration,
    minGap,
    onChange,
    onCommit,
    disabled,
    width: 0,
  });
  live.current = { start, end, duration, minGap, onChange, onCommit, disabled, width };

  const gesture = useRef({
    origin: 0,
    snapshotStart: 0,
    snapshotEnd: 0,
    width: 1,
    duration: 1,
  });

  const responders = useMemo(() => {
    const create = (which: 'start' | 'end') =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !live.current.disabled,
        onMoveShouldSetPanResponder: () => !live.current.disabled,
        onPanResponderGrant: () => {
          const state = live.current;
          gesture.current = {
            origin: which === 'start' ? state.start : state.end,
            snapshotStart: state.start,
            snapshotEnd: state.end,
            width: Math.max(1, state.width),
            duration: Math.max(0.1, state.duration),
          };
        },
        onPanResponderMove: (_event, gestureState) => {
          if (live.current.disabled) return;
          const snapState = gesture.current;
          const delta = (gestureState.dx / snapState.width) * snapState.duration;
          if (which === 'start') {
            const next = Math.min(
              Math.max(0, snapState.origin + delta),
              snapState.snapshotEnd - live.current.minGap
            );
            live.current.onChange(snap(next, snapState.duration), snapState.snapshotEnd);
          } else {
            const next = Math.max(
              Math.min(snapState.duration, snapState.origin + delta),
              snapState.snapshotStart + live.current.minGap
            );
            live.current.onChange(snapState.snapshotStart, snap(next, snapState.duration));
          }
        },
        onPanResponderRelease: () => live.current.onCommit?.(),
        onPanResponderTerminate: () => live.current.onCommit?.(),
      });
    return { start: create('start'), end: create('end') };
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    widthRef.current = nextWidth;
    live.current.width = nextWidth;
    setWidth(nextWidth);
  };

  const safeDuration = Math.max(0.1, duration);
  const toX = (value: number) => (Math.min(Math.max(0, value), safeDuration) / safeDuration) * width;
  const startX = toX(start);
  const endX = toX(end);

  const adjust = (which: 'start' | 'end', direction: 1 | -1) => {
    if (disabled) return;
    if (which === 'start') {
      const next = snap(Math.min(start + direction, end - minGap), safeDuration);
      onChange(next, end);
    } else {
      const next = snap(Math.max(end + direction, start + minGap), safeDuration);
      onChange(start, next);
    }
    onCommit?.();
  };

  return (
    <View style={{ gap: space.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'baseline' }}>
          <ThemedText variant="caption" tone="tertiary">
            {startLabel}
          </ThemedText>
          <ThemedText variant="caption" weight="semibold" numeric>
            {formatClock(start)}
          </ThemedText>
        </View>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'baseline' }}>
          <ThemedText variant="caption" tone="tertiary">
            {endLabel}
          </ThemedText>
          <ThemedText variant="caption" weight="semibold" numeric>
            {formatClock(end)}
          </ThemedText>
        </View>
      </View>

      <View style={{ marginHorizontal: HANDLE_HIT / 2 }}>
        <View style={{ height: TRACK_HEIGHT }} onLayout={onLayout}>
          <View
            style={{
              ...absoluteFill,
              borderRadius: radius.md,
              overflow: 'hidden',
              backgroundColor: theme.colors.videoBg,
            }}
          >
            <VideoThumb
              uri={uri}
              timeMs={Math.round(((start + end) / 2) * 1000)}
              style={{ ...absoluteFill, borderRadius: 0 }}
              iconSize={20}
            />
            <View
              style={{
                ...absoluteFill,
                backgroundColor: theme.colors.mediaShade,
              }}
            />
          </View>

          {width > 0 ? (
            <>
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: startX,
                  width: Math.max(2, endX - startX),
                  borderWidth: 2,
                  borderColor: theme.colors.accent,
                  borderRadius: radius.sm,
                  backgroundColor: theme.colors.accentWash,
                }}
              />

              <View
                {...responders.start.panHandlers}
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={startLabel}
                accessibilityValue={{
                  min: 0,
                  max: Math.round(safeDuration),
                  now: Math.round(start),
                  text: formatClock(start),
                }}
                accessibilityActions={[
                  { name: 'increment', label: incrementLabel },
                  { name: 'decrement', label: decrementLabel },
                ]}
                onAccessibilityAction={(event) => {
                  const action = event.nativeEvent.actionName;
                  if (action === 'increment') adjust('start', 1);
                  if (action === 'decrement') adjust('start', -1);
                }}
                hitSlop={{ top: 8, bottom: 8 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  height: TRACK_HEIGHT,
                  width: HANDLE_HIT,
                  left: startX - HANDLE_HIT / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Handle visual={theme.colors.accentFill} grip={theme.colors.onAccent} />
              </View>

              <View
                {...responders.end.panHandlers}
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={endLabel}
                accessibilityValue={{
                  min: 0,
                  max: Math.round(safeDuration),
                  now: Math.round(end),
                  text: formatClock(end),
                }}
                accessibilityActions={[
                  { name: 'increment', label: incrementLabel },
                  { name: 'decrement', label: decrementLabel },
                ]}
                onAccessibilityAction={(event) => {
                  const action = event.nativeEvent.actionName;
                  if (action === 'increment') adjust('end', 1);
                  if (action === 'decrement') adjust('end', -1);
                }}
                hitSlop={{ top: 8, bottom: 8 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  height: TRACK_HEIGHT,
                  width: HANDLE_HIT,
                  left: endX - HANDLE_HIT / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Handle visual={theme.colors.accentFill} grip={theme.colors.onAccent} />
              </View>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function Handle({ visual, grip }: { visual: string; grip: string }) {
  return (
    <View
      style={{
        width: HANDLE_WIDTH,
        height: HANDLE_HEIGHT,
        borderRadius: radius.sm,
        backgroundColor: visual,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 3,
      }}
    >
      <View style={{ width: 2, height: 18, borderRadius: 1, backgroundColor: grip }} />
      <View style={{ width: 2, height: 18, borderRadius: 1, backgroundColor: grip }} />
    </View>
  );
}
