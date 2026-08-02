/**
 * Avatar shop item definitions for the Avatar Customization System
 * (see ForIra-akr). Each item is described declaratively as a small list of
 * SVG shapes rather than a full component, so the same data can back both
 * the shop thumbnails (rendered as a mini standalone SVG) and the layered
 * preview on top of the Mascot (see components/AvatarPreview.tsx).
 *
 * All shape coordinates are expressed in the same 0-100 x 0-120 viewBox
 * that components/Mascot.tsx uses, so a shape's (x, y) / (cx, cy) values
 * line up with mascot features (head circle centered at 50,40; body
 * ellipse centered at 50,78) without any extra transform math.
 */

export type AvatarCategory = 'hat' | 'glasses' | 'wings' | 'background';

/** A single primitive SVG shape making up part of an accessory. */
export type AvatarShape =
  | {
      kind: 'path';
      d: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      opacity?: number;
    }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill?: string; opacity?: number }
  | {
      kind: 'ellipse';
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      fill?: string;
      opacity?: number;
    }
  | {
      kind: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      fill?: string;
      opacity?: number;
    };

export interface AvatarItem {
  /** Stable id, stored in AvatarLoadout / ownedItems (see useProgress.ts). */
  id: string;
  /** Display name shown in the shop. */
  name: string;
  /** Coin cost. 0 == the always-owned "none" option for the category. */
  cost: number;
  /** Emoji shown as a lightweight shop thumbnail. */
  emoji: string;
  /**
   * SVG shapes making up this accessory, positioned in the Mascot's
   * 0-100 x 0-120 viewBox. Empty for "none" items.
   */
  shapes: AvatarShape[];
}

export interface AvatarCategoryDef {
  key: AvatarCategory;
  label: string;
  items: AvatarItem[];
}

/** Items with cost 0 are the default "none" option and are always owned. */
export function isFreeAvatarItem(item: AvatarItem): boolean {
  return item.cost === 0;
}

export const AVATAR_ITEMS: AvatarCategoryDef[] = [
  {
    key: 'hat',
    label: 'Hat',
    items: [
      { id: 'hat_none', name: 'None', cost: 0, emoji: '🚫', shapes: [] },
      {
        id: 'hat_party',
        name: 'Party Hat',
        cost: 20,
        emoji: '🎉',
        shapes: [
          { kind: 'path', d: 'M50 2 L38 22 L62 22 Z', fill: '#FF5252' },
          { kind: 'circle', cx: 62, cy: 22, r: 2.5, fill: '#FFD740' },
          { kind: 'path', d: 'M42 14 L48 16 L44 20 Z', fill: '#FFD740' },
          { kind: 'path', d: 'M54 10 L58 13 L52 15 Z', fill: '#40C4FF' },
        ],
      },
      {
        id: 'hat_wizard',
        name: 'Wizard Hat',
        cost: 35,
        emoji: '🧙',
        shapes: [
          { kind: 'path', d: 'M50 -6 L36 24 L64 24 Z', fill: '#5C4EE5' },
          { kind: 'ellipse', cx: 50, cy: 24, rx: 18, ry: 4, fill: '#3A2E9E' },
          { kind: 'circle', cx: 50, cy: 6, r: 2, fill: '#FFD740' },
          { kind: 'circle', cx: 44, cy: 14, r: 1.4, fill: '#FFD740' },
          { kind: 'circle', cx: 57, cy: 18, r: 1.4, fill: '#FFD740' },
        ],
      },
      {
        id: 'hat_crown',
        name: 'Crown',
        cost: 50,
        emoji: '👑',
        shapes: [
          {
            kind: 'path',
            d: 'M34 22 L38 8 L46 18 L50 6 L54 18 L62 8 L66 22 Z',
            fill: '#FFD700',
            stroke: '#FFA500',
            strokeWidth: 0.75,
          },
          { kind: 'rect', x: 34, y: 21, width: 32, height: 4, rx: 1, fill: '#FFD700' },
          { kind: 'circle', cx: 50, cy: 12, r: 1.6, fill: '#E91E63' },
          { kind: 'circle', cx: 40, cy: 16, r: 1.2, fill: '#40C4FF' },
          { kind: 'circle', cx: 60, cy: 16, r: 1.2, fill: '#40C4FF' },
        ],
      },
    ],
  },
  {
    key: 'glasses',
    label: 'Glasses',
    items: [
      { id: 'glasses_none', name: 'None', cost: 0, emoji: '🚫', shapes: [] },
      {
        id: 'glasses_sun',
        name: 'Sunglasses',
        cost: 15,
        emoji: '😎',
        shapes: [
          { kind: 'circle', cx: 40, cy: 40, r: 5.5, fill: '#222', opacity: 0.85 },
          { kind: 'circle', cx: 60, cy: 40, r: 5.5, fill: '#222', opacity: 0.85 },
          { kind: 'path', d: 'M45.5 40 L54.5 40', stroke: '#222', strokeWidth: 1.5 },
          { kind: 'path', d: 'M34.5 39 L30 37', stroke: '#222', strokeWidth: 1.5 },
          { kind: 'path', d: 'M65.5 39 L70 37', stroke: '#222', strokeWidth: 1.5 },
        ],
      },
      {
        id: 'glasses_star',
        name: 'Star Glasses',
        cost: 30,
        emoji: '🤩',
        shapes: [
          {
            kind: 'path',
            d: 'M40 34 L42 38 L46.5 38.5 L43 41.5 L44 46 L40 43.5 L36 46 L37 41.5 L33.5 38.5 L38 38 Z',
            fill: '#E91E63',
          },
          {
            kind: 'path',
            d: 'M60 34 L62 38 L66.5 38.5 L63 41.5 L64 46 L60 43.5 L56 46 L57 41.5 L53.5 38.5 L58 38 Z',
            fill: '#E91E63',
          },
          { kind: 'path', d: 'M46 40 L54 40', stroke: '#E91E63', strokeWidth: 1.5 },
        ],
      },
      {
        id: 'glasses_heart',
        name: 'Heart Glasses',
        cost: 30,
        emoji: '😍',
        shapes: [
          {
            kind: 'path',
            d: 'M40 37 C37 33 31 35 31 39.5 C31 44 40 48 40 48 C40 48 49 44 49 39.5 C49 35 43 33 40 37 Z',
            fill: '#FF69B4',
          },
          {
            kind: 'path',
            d: 'M60 37 C57 33 51 35 51 39.5 C51 44 60 48 60 48 C60 48 69 44 69 39.5 C69 35 63 33 60 37 Z',
            fill: '#FF69B4',
          },
          { kind: 'path', d: 'M49 40 L51 40', stroke: '#FF69B4', strokeWidth: 1.5 },
        ],
      },
    ],
  },
  {
    key: 'wings',
    label: 'Wings',
    items: [
      { id: 'wings_none', name: 'None', cost: 0, emoji: '🚫', shapes: [] },
      {
        id: 'wings_fairy',
        name: 'Fairy Wings',
        cost: 40,
        emoji: '🧚',
        shapes: [
          {
            kind: 'path',
            d: 'M28 70 Q6 60 4 78 Q6 94 28 84 Z',
            fill: '#B3E5FC',
            opacity: 0.8,
          },
          {
            kind: 'path',
            d: 'M72 70 Q94 60 96 78 Q94 94 72 84 Z',
            fill: '#B3E5FC',
            opacity: 0.8,
          },
        ],
      },
      {
        id: 'wings_butterfly',
        name: 'Butterfly Wings',
        cost: 45,
        emoji: '🦋',
        shapes: [
          { kind: 'ellipse', cx: 16, cy: 70, rx: 12, ry: 16, fill: '#BA55D3', opacity: 0.85 },
          { kind: 'ellipse', cx: 20, cy: 90, rx: 8, ry: 10, fill: '#FF69B4', opacity: 0.85 },
          { kind: 'ellipse', cx: 84, cy: 70, rx: 12, ry: 16, fill: '#BA55D3', opacity: 0.85 },
          { kind: 'ellipse', cx: 80, cy: 90, rx: 8, ry: 10, fill: '#FF69B4', opacity: 0.85 },
          { kind: 'circle', cx: 16, cy: 70, r: 3, fill: '#FFD700', opacity: 0.9 },
          { kind: 'circle', cx: 84, cy: 70, r: 3, fill: '#FFD700', opacity: 0.9 },
        ],
      },
      {
        id: 'wings_angel',
        name: 'Angel Wings',
        cost: 60,
        emoji: '👼',
        shapes: [
          {
            kind: 'path',
            d: 'M30 68 Q4 55 2 76 Q2 98 30 88 Q22 78 30 68 Z',
            fill: '#FFFFFF',
            stroke: '#E0E0E0',
            strokeWidth: 0.5,
          },
          {
            kind: 'path',
            d: 'M70 68 Q96 55 98 76 Q98 98 70 88 Q78 78 70 68 Z',
            fill: '#FFFFFF',
            stroke: '#E0E0E0',
            strokeWidth: 0.5,
          },
        ],
      },
    ],
  },
  {
    key: 'background',
    label: 'Background',
    items: [
      { id: 'bg_none', name: 'Plain', cost: 0, emoji: '⬜', shapes: [] },
      {
        id: 'bg_rainbow',
        name: 'Rainbow',
        cost: 25,
        emoji: '🌈',
        shapes: [
          { kind: 'path', d: 'M-10 60 A60 60 0 0 1 110 60', stroke: '#FF5252', strokeWidth: 6 },
          { kind: 'path', d: 'M-10 68 A52 52 0 0 1 110 68', stroke: '#FFD740', strokeWidth: 6 },
          { kind: 'path', d: 'M-10 76 A44 44 0 0 1 110 76', stroke: '#69F0AE', strokeWidth: 6 },
          { kind: 'path', d: 'M-10 84 A36 36 0 0 1 110 84', stroke: '#40C4FF', strokeWidth: 6 },
        ],
      },
      {
        id: 'bg_stars',
        name: 'Starry Sky',
        cost: 30,
        emoji: '✨',
        shapes: [
          { kind: 'rect', x: 0, y: 0, width: 100, height: 120, fill: '#283593', opacity: 0.25 },
          { kind: 'circle', cx: 12, cy: 15, r: 1.5, fill: '#FFD740' },
          { kind: 'circle', cx: 85, cy: 12, r: 1.2, fill: '#FFD740' },
          { kind: 'circle', cx: 70, cy: 25, r: 1, fill: '#FFFFFF' },
          { kind: 'circle', cx: 22, cy: 30, r: 1, fill: '#FFFFFF' },
          { kind: 'circle', cx: 92, cy: 40, r: 1.4, fill: '#FFD740' },
          { kind: 'circle', cx: 6, cy: 50, r: 1, fill: '#FFFFFF' },
        ],
      },
      {
        id: 'bg_meadow',
        name: 'Meadow',
        cost: 30,
        emoji: '🌼',
        shapes: [
          { kind: 'circle', cx: 85, cy: 15, r: 8, fill: '#FFD740', opacity: 0.7 },
          { kind: 'rect', x: 0, y: 100, width: 100, height: 20, fill: '#8BC34A', opacity: 0.6 },
          { kind: 'circle', cx: 15, cy: 108, r: 3, fill: '#FFFFFF', opacity: 0.8 },
          { kind: 'circle', cx: 78, cy: 112, r: 3, fill: '#FFFFFF', opacity: 0.8 },
        ],
      },
    ],
  },
];

/** Looks up a single item by category + id. Returns undefined if not found. */
export function findAvatarItem(
  category: AvatarCategory,
  id: string | null | undefined
): AvatarItem | undefined {
  if (!id) return undefined;
  return AVATAR_ITEMS.find((c) => c.key === category)?.items.find((i) => i.id === id);
}
