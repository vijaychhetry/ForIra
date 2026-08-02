import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const PARTICLE_COUNT = 26;
const DURATION_MS = 1800;
const MAX_START_DELAY_MS = 300;

/** Cheerful palette the particles are randomly colored from. */
const COLORS = ['#FF5252', '#FFD740', '#69F0AE', '#40C4FF', '#E040FB', '#FF6E40', '#FF80AB'];

interface ParticleConfig {
  id: number;
  color: string;
  shape: 'circle' | 'rect';
  size: number;
  startX: number;
  drift: number;
  delay: number;
  spin: number;
}

function buildParticleConfigs(width: number): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: Math.random() > 0.45 ? 'circle' : 'rect',
    size: 6 + Math.random() * 8,
    startX: Math.random() * Math.max(width - 20, 1),
    // Random horizontal drift away from the particle's start position.
    drift: (Math.random() - 0.5) * 140,
    delay: Math.random() * MAX_START_DELAY_MS,
    spin: (180 + Math.random() * 360) * (Math.random() > 0.5 ? 1 : -1),
  }));
}

interface ParticleProps {
  config: ParticleConfig;
  /** Incremented every time burst() is called; triggers this particle's fall. */
  triggerKey: number;
  screenHeight: number;
}

function Particle({ config, triggerKey, screenHeight }: ParticleProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) {
      return;
    }
    // Reset to the top, then animate down with a gravity-style ease-in curve.
    translateY.value = -20;
    translateX.value = 0;
    rotate.value = 0;
    opacity.value = 1;

    translateY.value = withDelay(
      config.delay,
      withTiming(screenHeight + 40, { duration: DURATION_MS, easing: Easing.in(Easing.quad) })
    );
    translateX.value = withDelay(
      config.delay,
      withTiming(config.drift, { duration: DURATION_MS, easing: Easing.out(Easing.quad) })
    );
    rotate.value = withDelay(config.delay, withTiming(config.spin, { duration: DURATION_MS, easing: Easing.linear }));
    opacity.value = withDelay(
      config.delay + DURATION_MS * 0.6,
      withTiming(0, { duration: DURATION_MS * 0.4, easing: Easing.linear })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: config.startX,
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
          borderRadius: config.shape === 'circle' ? config.size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export interface ConfettiHandle {
  /** Triggers a ~2s confetti burst from the top of the screen. */
  burst: () => void;
}

interface ConfettiProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Absolute-positioned confetti overlay. Renders nothing until burst() is
 * called via ref, then bursts 20-30 colorful SVG-like particles from the
 * top of the screen with gravity fall, drift, and fade-out.
 */
export const Confetti = forwardRef<ConfettiHandle, ConfettiProps>(function Confetti({ style }, ref) {
  const { width, height } = useWindowDimensions();
  const configs = useMemo(() => buildParticleConfigs(width), [width]);
  const [visible, setVisible] = useState(false);
  const [triggerKey, setTriggerKey] = useState(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      burst: () => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        setVisible(true);
        setTriggerKey((k) => k + 1);
        hideTimeoutRef.current = setTimeout(() => {
          setVisible(false);
        }, DURATION_MS + MAX_START_DELAY_MS + 150);
      },
    }),
    []
  );

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, style]}>
      {configs.map((config) => (
        <Particle key={config.id} config={config} triggerKey={triggerKey} screenHeight={height} />
      ))}
    </View>
  );
});

export default Confetti;

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
  },
});
