import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { AvatarShape, findAvatarItem } from '../app/constants/avatarItems';
import { AvatarLoadout } from '../app/hooks/useProgress';
import { Mascot, MascotMood } from './Mascot';

export interface AvatarPreviewProps {
  /** Currently equipped item id per category (hat/glasses/wings/background). */
  equippedItems: AvatarLoadout;
  /** Forwarded to the underlying Mascot for mood-based animation. */
  mood?: MascotMood;
  /** Width of the preview in pixels. Height scales the same 1.2x as Mascot. */
  size?: number;
}

/** Renders a single declarative AvatarShape (see avatarItems.ts) as an SVG primitive. */
function renderShape(shape: AvatarShape, key: number) {
  switch (shape.kind) {
    case 'path':
      return (
        <Path
          key={key}
          d={shape.d}
          fill={shape.fill ?? 'none'}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          strokeLinecap="round"
          opacity={shape.opacity}
        />
      );
    case 'circle':
      return (
        <Circle
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={shape.fill ?? '#000'}
          opacity={shape.opacity}
        />
      );
    case 'ellipse':
      return (
        <Ellipse
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          fill={shape.fill ?? '#000'}
          opacity={shape.opacity}
        />
      );
    case 'rect':
      return (
        <Rect
          key={key}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.rx}
          fill={shape.fill ?? '#000'}
          opacity={shape.opacity}
        />
      );
    default:
      return null;
  }
}

/**
 * Renders the Mascot with the currently-equipped avatar accessories layered
 * on top, each accessory category as its own SVG group positioned in the
 * same 0-100 x 0-120 viewBox that Mascot.tsx uses internally.
 *
 * Layering order (back to front): background, mascot, wings, hat, glasses --
 * so a background fills the whole frame, wings peek out from behind the
 * body, and hat/glasses sit on top of the head.
 */
export function AvatarPreview({ equippedItems, mood = 'idle', size = 120 }: AvatarPreviewProps) {
  const height = size * 1.2;

  const backgroundItem = findAvatarItem('background', equippedItems.background);
  const wingsItem = findAvatarItem('wings', equippedItems.wings);
  const hatItem = findAvatarItem('hat', equippedItems.hat);
  const glassesItem = findAvatarItem('glasses', equippedItems.glasses);

  return (
    <View style={[styles.container, { width: size, height }]}>
      {backgroundItem && backgroundItem.shapes.length > 0 && (
        <Svg
          width={size}
          height={height}
          viewBox="0 0 100 120"
          style={StyleSheet.absoluteFill}
        >
          <G>{backgroundItem.shapes.map((shape, i) => renderShape(shape, i))}</G>
        </Svg>
      )}

      <Mascot mood={mood} size={size} />

      {(wingsItem?.shapes.length || hatItem?.shapes.length || glassesItem?.shapes.length) ? (
        <Svg
          width={size}
          height={height}
          viewBox="0 0 100 120"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          {wingsItem && wingsItem.shapes.length > 0 && (
            <G>{wingsItem.shapes.map((shape, i) => renderShape(shape, i))}</G>
          )}
          {hatItem && hatItem.shapes.length > 0 && (
            <G>{hatItem.shapes.map((shape, i) => renderShape(shape, i))}</G>
          )}
          {glassesItem && glassesItem.shapes.length > 0 && (
            <G>{glassesItem.shapes.map((shape, i) => renderShape(shape, i))}</G>
          )}
        </Svg>
      ) : null}
    </View>
  );
}

export default AvatarPreview;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
