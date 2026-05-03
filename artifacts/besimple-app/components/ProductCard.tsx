import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { getImageUrl } from "@/utils/imageUrl";

interface Props {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  onAddToCart?: () => void;
}

export function ProductCard({ id, name, price, imageUrl, category, onAddToCart }: Props) {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/product/${id}`);
  };

  const handleAdd = (e: { stopPropagation: () => void }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddToCart?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: getImageUrl(imageUrl) }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={[styles.badge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{category}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.bottom}>
          <Text style={[styles.price, { color: colors.primary }]}>
            ৳{price.toLocaleString()}
          </Text>
          <Pressable
            onPress={handleAdd}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            hitSlop={8}
          >
            <Feather name="plus" size={14} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    flex: 1,
  },
  imageWrap: {
    aspectRatio: 1,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
    gap: 6,
  },
  name: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
