import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export type MascotMood = 'idle' | 'happy' | 'sad' | 'celebrate';

export interface MascotProps {
  /** Controls the animation behaviour. Defaults to 'idle'. */
  mood?: MascotMood;
  /** Width of the mascot in pixels. Height scales proportionally (1.2x). Defaults to 120. */
  size?: number;
}

const AnimatedG = Animated.createAnimatedComponent(G);

/* ---------- colour palette ---------- */
const BODY = '#E8D5F5';
const BODY_DARK = '#D4B8E8';
const HEAD_FILL = '#FFF5F9';
const HORN_FILL = '#FFD700';
const HORN_STROKE = '#FFA500';
const MANE_1 = '#FF69B4';
const MANE_2 = '#BA55D3';
const MANE_3 = '#9370DB';
const EYE = '#333333';
const MOUTH = '#FF69B4';
const BLUSH = '#FFB6C1';
const EAR_INNER = '#FFB6C1';
const SPARKLE = '#FFD700';

/**
 * Animated SVG unicorn mascot.
 *
 * Renders a cute, stylised unicorn whose animation changes based on the
 * `mood` prop. All animations use react-native-reanimated shared values.
 *
 * SVG groups: head, body, horn, mane, eyes, mouth (each a distinct `<G>`).
 */
export function Mascot({ mood = 'idle', size = 120 }: MascotProps) {
  const svgHeight = size * 1.2;

  /* ---- shared animation values ---- */
  const floatY = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const swayX = useSharedValue(0);
  const headRotate = useSharedValue(0);
  const sparkleOp = useSharedValue(0);

  useEffect(() => {
    // Cancel all running animations before switching mood
    cancelAnimation(floatY);
    cancelAnimation(scaleAnim);
    cancelAnimation(swayX);
    cancelAnimation(headRotate);
    cancelAnimation(sparkleOp);

    // Reset to resting state
    floatY.value = 0;
    scaleAnim.value = 1;
    swayX.value = 0;
    headRotate.value = 0;
    sparkleOp.value = 0;

    switch (mood) {
      case 'idle':
        // Gentle up/down float via withRepeat + withSequence
        floatY.value = withRepeat(
          withSequence(
            withTiming(-6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            withTiming(6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          ),
          -1, // infinite
          true,
        );
        break;

      case 'happy':
        // Spring bounce
        scaleAnim.value = withRepeat(
          withSequence(
            withSpring(1.12, { damping: 4, stiffness: 200 }),
            withSpring(1.0, { damping: 6, stiffness: 120 }),
          ),
          -1,
        );
        // Sparkle pulse
        sparkleOp.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0, { duration: 400 }),
          ),
          -1,
          true,
        );
        break;

      case 'sad':
        // Head tilt rotation
        headRotate.value = withTiming(-10, {
          duration: 600,
          easing: Easing.out(Easing.ease),
        });
        // Slight downward droop
        floatY.value = withTiming(4, { duration: 800 });
        break;

      case 'celebrate':
        // Side-to-side dance sway
        swayX.value = withRepeat(
          withSequence(
            withTiming(8, { duration: 250, easing: Easing.inOut(Easing.ease) }),
            withTiming(-8, { duration: 250, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        );
        // Accompanying scale pulse for bouncier feel
        scaleAnim.value = withRepeat(
          withSequence(
            withTiming(1.06, { duration: 250 }),
            withTiming(0.94, { duration: 250 }),
          ),
          -1,
          true,
        );
        break;
    }
  }, [mood, floatY, scaleAnim, swayX, headRotate, sparkleOp]);

  /* ---- animated styles & props ---- */

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { translateX: swayX.value },
      { scale: scaleAnim.value },
    ],
  }));

  // Animated rotation for the head <G> (sad-mode tilt)
  const headAnimatedProps = useAnimatedProps(() => ({
    rotation: headRotate.value,
  }));

  // Animated opacity for sparkle <G> (happy-mode pulse)
  const sparkleAnimatedProps = useAnimatedProps(() => ({
    opacity: sparkleOp.value,
  }));

  const isSad = mood === 'sad';

  return (
    <Animated.View
      style={[styles.container, { width: size, height: svgHeight }, containerStyle]}
    >
      <Svg width={size} height={svgHeight} viewBox="0 0 100 120">
        {/* ========== Body ========== */}
        <G>
          {/* Torso */}
          <Ellipse cx={50} cy={78} rx={24} ry={18} fill={BODY} />

          {/* Legs (four stubby rounded rectangles) */}
          <Rect x={30} y={92} width={9} height={15} rx={4.5} fill={BODY_DARK} />
          <Rect x={41} y={94} width={8} height={13} rx={4} fill={BODY_DARK} />
          <Rect x={52} y={94} width={8} height={13} rx={4} fill={BODY_DARK} />
          <Rect x={62} y={92} width={9} height={15} rx={4.5} fill={BODY_DARK} />

          {/* Tail (two coloured strands on the right) */}
          <Path
            d="M74 74 Q86 66 82 56"
            fill="none"
            stroke={MANE_1}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path
            d="M76 72 Q90 62 84 52"
            fill="none"
            stroke={MANE_2}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </G>

        {/* ========== Head (animated for sad-mode tilt) ========== */}
        <AnimatedG animatedProps={headAnimatedProps} originX={50} originY={55}>
          {/* Head circle */}
          <Circle
            cx={50}
            cy={40}
            r={22}
            fill={HEAD_FILL}
            stroke={BODY}
            strokeWidth={1}
          />

          {/* Ears */}
          <Path
            d="M32 24 L27 8 L38 20 Z"
            fill={HEAD_FILL}
            stroke={BODY}
            strokeWidth={0.5}
          />
          <Path
            d="M68 24 L73 8 L62 20 Z"
            fill={HEAD_FILL}
            stroke={BODY}
            strokeWidth={0.5}
          />
          {/* Inner ears */}
          <Path d="M33 23 L29 12 L37 20 Z" fill={EAR_INNER} />
          <Path d="M67 23 L71 12 L63 20 Z" fill={EAR_INNER} />

          {/* ---- Horn ---- */}
          <G>
            <Path
              d="M50 18 L44 2 Q50 -2 56 2 Z"
              fill={HORN_FILL}
              stroke={HORN_STROKE}
              strokeWidth={0.5}
            />
          </G>

          {/* ---- Mane (flowing curves on the left) ---- */}
          <G>
            <Path d="M30 20 Q18 28 22 44 Q26 34 32 26" fill={MANE_1} />
            <Path d="M28 28 Q14 38 20 54 Q24 44 30 36" fill={MANE_2} />
            <Path d="M26 38 Q12 48 18 62 Q22 52 28 46" fill={MANE_3} />
          </G>

          {/* ---- Eyes ---- */}
          <G>
            {/* Irises */}
            <Circle cx={40} cy={40} r={3.5} fill={EYE} />
            <Circle cx={60} cy={40} r={3.5} fill={EYE} />
            {/* Sparkle highlights */}
            <Circle cx={41.5} cy={38.5} r={1.2} fill="#FFFFFF" />
            <Circle cx={61.5} cy={38.5} r={1.2} fill="#FFFFFF" />
          </G>

          {/* Blush cheeks */}
          <Ellipse cx={33} cy={48} rx={4} ry={2.5} fill={BLUSH} opacity={0.5} />
          <Ellipse cx={67} cy={48} rx={4} ry={2.5} fill={BLUSH} opacity={0.5} />

          {/* ---- Mouth ---- */}
          <G>
            <Path
              d={isSad ? 'M44 52 Q50 47 56 52' : 'M44 50 Q50 56 56 50'}
              fill="none"
              stroke={MOUTH}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </G>
        </AnimatedG>

        {/* ========== Sparkles (happy-mood pulsing decorations) ========== */}
        <AnimatedG animatedProps={sparkleAnimatedProps}>
          {/* Four-point star shapes */}
          <Path
            d="M15 20 L17 16 L19 20 L23 22 L19 24 L17 28 L15 24 L11 22 Z"
            fill={SPARKLE}
          />
          <Path
            d="M78 15 L80 11 L82 15 L86 17 L82 19 L80 23 L78 19 L74 17 Z"
            fill={SPARKLE}
          />
          <Path
            d="M85 55 L87 51 L89 55 L93 57 L89 59 L87 63 L85 59 L81 57 Z"
            fill={SPARKLE}
          />
          {/* Small accent dots */}
          <Circle cx={8} cy={50} r={2} fill={SPARKLE} />
          <Circle cx={92} cy={35} r={1.5} fill={SPARKLE} />
        </AnimatedG>
      </Svg>
    </Animated.View>
  );
}

export default Mascot;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
