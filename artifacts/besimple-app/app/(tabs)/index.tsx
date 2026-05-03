import { Feather } from "@expo/vector-icons";
import { useGetFeaturedProducts, useListProducts } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["All", "Anime", "Streetwear", "Music", "Gaming", "Limited"];

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, itemCount } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");

  const {
    data: allProducts,
    isLoading,
    refetch,
    isRefetching,
  } = useListProducts(
    activeCategory !== "All" ? { category: activeCategory.toLowerCase() } : {},
  );

  const { data: featured } = useGetFeaturedProducts();

  const handleAddToCart = (product: { id: number; name: string; imageUrl: string; price: number; sizes: string[]; colors: string[] }) => {
    addItem({
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      size: product.sizes[0] ?? "M",
      color: product.colors[0] ?? "Black",
      quantity: 1,
      price: product.price,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>
            BE SIMPLE <Text style={{ color: colors.primary }}>75</Text>
          </Text>
          <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
            Bangladesh Streetwear
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/cart")}
          style={[styles.cartBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="shopping-bag" size={20} color={colors.foreground} />
          {itemCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeCount}>{itemCount > 9 ? "9+" : itemCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={[styles.categoryContent, { paddingLeft: 16 }]}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.categoryPill,
              {
                backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                borderColor: activeCategory === cat ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: activeCategory === cat ? "#fff" : colors.mutedForeground },
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
        <View style={{ width: 16 }} />
      </ScrollView>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={allProducts ?? []}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!(allProducts && allProducts.length > 0)}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="package" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No products yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              id={item.id}
              name={item.name}
              price={item.price}
              imageUrl={item.imageUrl}
              category={item.category}
              onAddToCart={() => handleAddToCart(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeCount: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  categoryScroll: {
    flexGrow: 0,
    paddingVertical: 12,
  },
  categoryContent: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  grid: {
    paddingHorizontal: 12,
    paddingTop: 4,
    gap: 10,
  },
  row: {
    gap: 10,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
