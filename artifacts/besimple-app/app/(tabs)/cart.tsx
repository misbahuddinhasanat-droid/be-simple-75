import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { getImageUrl } from "@/utils/imageUrl";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, total, itemCount, removeItem, updateQuantity } = useCart();

  const isEmpty = items.length === 0;

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
        <Text style={[styles.title, { color: colors.foreground }]}>
          My Bag
          {itemCount > 0 && (
            <Text style={{ color: colors.primary }}> ({itemCount})</Text>
          )}
        </Text>
      </View>

      {isEmpty ? (
        <View style={styles.empty}>
          <Feather name="shopping-bag" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Your bag is empty
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Add some fire pieces to your cart
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/")}
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + 200 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.cartItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Image
                  source={{ uri: getImageUrl(item.productImageUrl) }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, { color: colors.foreground }]}
                    numberOfLines={2}
                  >
                    {item.productName}
                  </Text>
                  <View style={styles.itemMeta}>
                    <View
                      style={[
                        styles.metaBadge,
                        { backgroundColor: colors.muted, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                        {item.size}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.metaBadge,
                        { backgroundColor: colors.muted, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                        {item.color}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemFooter}>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </Text>
                    <View style={styles.qtyRow}>
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          updateQuantity(item.id, item.quantity - 1);
                        }}
                        style={[
                          styles.qtyBtn,
                          { backgroundColor: colors.muted, borderColor: colors.border },
                        ]}
                      >
                        <Feather
                          name={item.quantity === 1 ? "trash-2" : "minus"}
                          size={12}
                          color={item.quantity === 1 ? colors.destructive : colors.mutedForeground}
                        />
                      </Pressable>
                      <Text style={[styles.qty, { color: colors.foreground }]}>
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        style={[
                          styles.qtyBtn,
                          { backgroundColor: colors.muted, borderColor: colors.border },
                        ]}
                      >
                        <Feather name="plus" size={12} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View
            style={[
              styles.checkout,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
                Total
              </Text>
              <Text style={[styles.totalAmount, { color: colors.foreground }]}>
                ৳{total.toLocaleString()}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/checkout")}
              style={({ pressed }) => [
                styles.checkoutBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="arrow-right" size={18} color="#fff" />
              <Text style={styles.checkoutBtnText}>Place Order</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  shopBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  itemImage: {
    width: 96,
    height: 96,
  },
  itemInfo: {
    flex: 1,
    padding: 10,
    gap: 4,
  },
  itemName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: "row",
    gap: 6,
  },
  metaBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  metaText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    minWidth: 16,
    textAlign: "center",
  },
  checkout: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  totalAmount: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  checkoutBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
