import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AvatarLoadout, useProgress } from '../hooks/useProgress';
import { useCoins } from '../hooks/useCoins';

type AvatarCategory = keyof AvatarLoadout;

interface AvatarItem {
  id: string;
  name: string;
  cost: number;
  emoji: string;
}

interface AvatarCategoryDef {
  key: AvatarCategory;
  label: string;
  items: AvatarItem[];
}

/**
 * Item definitions for the avatar shop. Placeholder emoji thumbnails are
 * used until dedicated SVG accessory art (see ForIra-xcu) lands -- at that
 * point this data + the preview below can move to a shared
 * app/constants/avatarItems.ts + components/AvatarPreview.tsx.
 */
const AVATAR_CATEGORIES: AvatarCategoryDef[] = [
  {
    key: 'hat',
    label: 'Hat',
    items: [
      { id: 'hat_none', name: 'None', cost: 0, emoji: '🚫' },
      { id: 'hat_party', name: 'Party Hat', cost: 20, emoji: '🎉' },
      { id: 'hat_wizard', name: 'Wizard Hat', cost: 35, emoji: '🧙' },
      { id: 'hat_crown', name: 'Crown', cost: 50, emoji: '👑' },
    ],
  },
  {
    key: 'glasses',
    label: 'Glasses',
    items: [
      { id: 'glasses_none', name: 'None', cost: 0, emoji: '🚫' },
      { id: 'glasses_sun', name: 'Sunglasses', cost: 15, emoji: '😎' },
      { id: 'glasses_star', name: 'Star Glasses', cost: 30, emoji: '🤩' },
      { id: 'glasses_heart', name: 'Heart Glasses', cost: 30, emoji: '😍' },
    ],
  },
  {
    key: 'wings',
    label: 'Wings',
    items: [
      { id: 'wings_none', name: 'None', cost: 0, emoji: '🚫' },
      { id: 'wings_fairy', name: 'Fairy Wings', cost: 40, emoji: '🧚' },
      { id: 'wings_butterfly', name: 'Butterfly Wings', cost: 45, emoji: '🦋' },
      { id: 'wings_angel', name: 'Angel Wings', cost: 60, emoji: '👼' },
    ],
  },
  {
    key: 'background',
    label: 'Background',
    items: [
      { id: 'bg_none', name: 'Plain', cost: 0, emoji: '⬜' },
      { id: 'bg_rainbow', name: 'Rainbow', cost: 25, emoji: '🌈' },
      { id: 'bg_stars', name: 'Starry Sky', cost: 30, emoji: '✨' },
      { id: 'bg_meadow', name: 'Meadow', cost: 30, emoji: '🌼' },
    ],
  },
];

/** Items with cost 0 are the default "none" option and are always owned. */
function isFreeItem(item: AvatarItem): boolean {
  return item.cost === 0;
}

function EquippedBadge({ emoji }: { emoji: string }) {
  return (
    <View style={styles.equippedBadge}>
      <Text style={styles.equippedBadgeEmoji}>{emoji}</Text>
    </View>
  );
}

export default function AvatarScreen() {
  const router = useRouter();
  const { avatar, ownedItems, equipAvatarItem, addOwnedItem, loading } = useProgress();
  const { balance, spendCoins } = useCoins();
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('hat');

  const activeCategoryDef = useMemo(
    () => AVATAR_CATEGORIES.find((c) => c.key === activeCategory)!,
    [activeCategory]
  );

  const isOwned = (item: AvatarItem) => isFreeItem(item) || ownedItems.includes(item.id);
  const isEquipped = (category: AvatarCategory, item: AvatarItem) =>
    avatar[category] === item.id || (avatar[category] == null && isFreeItem(item));

  const handleEquip = async (category: AvatarCategory, item: AvatarItem) => {
    await equipAvatarItem(category, isFreeItem(item) ? null : item.id);
  };

  const handlePurchase = (category: AvatarCategory, item: AvatarItem) => {
    Alert.alert(
      'Buy item?',
      `Spend ${item.cost} coins on "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            const success = await spendCoins(item.cost);
            if (!success) {
              Alert.alert('Not enough coins', 'Earn more coins by completing levels!');
              return;
            }
            await addOwnedItem(item.id);
            await equipAvatarItem(category, item.id);
          },
        },
      ]
    );
  };

  const handleItemPress = (category: AvatarCategory, item: AvatarItem) => {
    if (isOwned(item)) {
      handleEquip(category, item);
    } else {
      handlePurchase(category, item);
    }
  };

  // Equipped emoji per category, for the badge row under the mascot preview.
  const equippedEmojis = AVATAR_CATEGORIES.map((cat) => {
    const equippedId = avatar[cat.key];
    const item = cat.items.find((i) => i.id === equippedId);
    return item && !isFreeItem(item) ? item.emoji : null;
  }).filter((e): e is string => !!e);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={22} color="#1976d2" />
        </Pressable>
        <Text style={styles.headerTitle}>My Avatar</Text>
        <View style={styles.coinPill}>
          <Ionicons name="logo-bitcoin" size={16} color="#ff9800" />
          <Text style={styles.coinText}>{balance}</Text>
        </View>
      </View>

      <View style={styles.previewArea}>
        <Mascot mood="happy" size={140} />
        {equippedEmojis.length > 0 && (
          <View style={styles.equippedRow}>
            {equippedEmojis.map((emoji, i) => (
              <EquippedBadge key={i} emoji={emoji} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.tabRow}>
        {AVATAR_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            onPress={() => setActiveCategory(cat.key)}
            style={[styles.tabBtn, activeCategory === cat.key && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeCategory === cat.key && styles.tabBtnTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {activeCategoryDef.items.map((item) => {
          const owned = isOwned(item);
          const equipped = isEquipped(activeCategory, item);

          return (
            <Animated.View
              key={item.id}
              entering={FadeInDown.duration(250)}
              style={[styles.itemCard, equipped && styles.itemCardEquipped]}
            >
              <Pressable
                onPress={() => handleItemPress(activeCategory, item)}
                style={styles.itemPressable}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemName}>{item.name}</Text>

                {owned ? (
                  <View style={styles.ownedRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                    <Text style={styles.ownedText}>Owned</Text>
                  </View>
                ) : (
                  <View style={styles.costRow}>
                    <Ionicons name="logo-bitcoin" size={14} color="#ff9800" />
                    <Text style={styles.costText}>{item.cost}</Text>
                  </View>
                )}

                {equipped && (
                  <View style={styles.equippedTag}>
                    <Text style={styles.equippedTagText}>Equipped</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerBack: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  coinText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ff9800',
  },
  previewArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  equippedRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  equippedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  equippedBadgeEmoji: {
    fontSize: 16,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#9c27b0',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  tabBtnTextActive: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  itemCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  itemCardEquipped: {
    borderColor: '#FFD700',
  },
  itemPressable: {
    alignItems: 'center',
    width: '100%',
  },
  itemEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  ownedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownedText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costText: {
    fontSize: 13,
    color: '#ff9800',
    fontWeight: '700',
  },
  equippedTag: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  equippedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
});
