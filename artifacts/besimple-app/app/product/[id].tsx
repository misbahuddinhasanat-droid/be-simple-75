import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetProduct } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem } = useCart();

  const productId = parseInt(id ?? "0", 10);
  const { data: product, isLoading } = useGetProduct(productId);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Product not found</Text>
      </View>
    );
  }

  const size = selectedSize || product.sizes[0] || "M";
  const color = selectedColor || product.colors[0] || "Black";

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      size,
      color,
      quantity: 1,
      price: product.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      size,
      color,
      quantity: 1,
      price: product.price,
    });
    router.push("/checkout");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable
        onPress={() => router.back()}
        style={[
          styles.backBtn,
          { top: insets.top + 12, backgroundColor: colors.card + "cc", borderColor: colors.border },
        ]}
      >
        <Feather name="arrow-left" size={20} color={colors.foreground} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" },
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {product.category.toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor: product.stock > 0 ? "#22c55e22" : "#ef444422",
                  borderColor: product.stock > 0 ? "#22c55e55" : "#ef444455",
                },
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  { color: product.stock > 0 ? "#22c55e" : "#ef4444" },
                ]}
              >
                {product.stock > 0 ? `${product.stock} left` : "Out of Stock"}
              </Text>
            </View>
          </View>

          <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            ৳{product.price.toLocaleString()}
          </Text>

          {product.sizes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                SIZE
              </Text>
              <View style={styles.optionsRow}>
                {product.sizes.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedSize(s);
                    }}
                    style={[
                      styles.optionBtn,
                      {
                        backgroundColor:
                          size === s ? colors.primary : colors.card,
                        borderColor: size === s ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: size === s ? "#fff" : colors.foreground },
                      ]}
                    >
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {product.colors.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                COLOR
              </Text>
              <View style={styles.optionsRow}>
                {product.colors.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedColor(c);
                    }}
                    style={[
                      styles.optionBtn,
                      {
                        backgroundColor:
                          color === c ? colors.primary : colors.card,
                        borderColor: color === c ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: color === c ? "#fff" : colors.foreground },
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {product.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.description, { color: colors.foreground }]}>
                {product.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.actions,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <Pressable
          onPress={handleAddToCart}
          style={({ pressed }) => [
            styles.addBtn,
            { borderColor: colors.primary, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Feather
            name={added ? "check" : "shopping-bag"}
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>
            {added ? "Added!" : "Add to Bag"}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleBuyNow}
          style={({ pressed }) => [
            styles.buyBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  categoryBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  stockBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stockText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  name: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
  },
  price: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
  },
  addBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  buyBtn: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
  },
  buyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
