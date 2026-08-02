import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const GOLD = '#FFC107';
const GRAY = '#BDBDBD';

/** Simple 5-point star path in a 24x24 viewBox. */
const STAR_PATH =
  'M12 2 L14.9 8.6 L22 9.3 L16.7 14.1 L18.2 21.2 L12 17.6 L5.8 21.2 L7.3 14.1 L2 9.3 L9.1 8.6 Z';

const STAGGER_DELAY_MS = 150;

interface SingleStarProps {
  filled: boolean;
  size: number;
  delay: number;
}

function SingleStar({ filled, size, delay }: SingleStarProps) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-45);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 6, stiffness: 120, mass: 0.6 }));
    rotate.value = withDelay(delay, withSpring(0, { damping: 8, stiffness: 100 }));
    // Re-run whenever this star's filled state or delay changes (e.g. new stars prop).
  }, [filled, delay, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.starWrapper, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d={STAR_PATH}
          fill={filled ? GOLD : 'transparent'}
          stroke={filled ? GOLD : GRAY}
          strokeWidth={filled ? 0 : 1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

export interface StarRatingProps {
  /** Number of filled stars, 0-3. */
  stars: number;
  /** Pixel size of each star. Defaults to 40. */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Displays a row of 3 stars (gold filled / gray outline) based on the
 * `stars` prop (0-3). Each star animates in with a staggered spring +
 * rotate whenever `stars` changes.
 */
export function StarRating({ stars, size = 40, style }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(3, Math.round(stars)));

  return (
    <View style={[styles.row, style]}>
      {[0, 1, 2].map((i) => (
        // Remounting on rating change restarts each star's entrance animation.
        <SingleStar key={`${clamped}-${i}`} filled={i < clamped} size={size} delay={i * STAGGER_DELAY_MS} />
      ))}
    </View>
  );
}

export default StarRating;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starWrapper: {
    marginHorizontal: 4,
  },
});
