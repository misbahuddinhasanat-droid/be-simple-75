import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { adminFetch } from "@/utils/adminFetch";
import { getImageUrl } from "@/utils/imageUrl";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  featured: boolean;
  stock: number;
  sizes: string[];
  colors: string[];
}

export default function AdminProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ price: string; stock: string }>({ price: "", stock: "" });
  const [saving, setSaving] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await adminFetch<Product[]>("/admin/products");
      setProducts(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: Product) => {
    setEditing(p.id);
    setEditData({ price: String(p.price), stock: String(p.stock) });
  };

  const cancelEdit = () => { setEditing(null); };

  const saveEdit = async (p: Product) => {
    const price = parseFloat(editData.price);
    const stock = parseInt(editData.stock, 10);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Invalid", "Enter a valid price"); return;
    }
    if (isNaN(stock) || stock < 0) {
      Alert.alert("Invalid", "Enter a valid stock number"); return;
    }
    setSaving(true);
    try {
      const updated = await adminFetch<Product>(`/admin/products/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ price, stock }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
      setEditing(null);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      const updated = await adminFetch<Product>(`/admin/products/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ featured: !p.featured }),
      });
      Haptics.selectionAsync();
      setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Products</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {products.length}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />
          }
        >
          {products.map((p) => (
            <View
              key={p.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.cardTop}>
                <Image
                  source={{ uri: getImageUrl(p.imageUrl) }}
                  style={styles.productImg}
                  contentFit="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.catBadge,
                        { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" },
                      ]}
                    >
                      <Text style={[styles.catText, { color: colors.primary }]}>
                        {p.category.toUpperCase()}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => toggleFeatured(p)}
                      style={[
                        styles.featuredToggle,
                        {
                          backgroundColor: p.featured ? "#f59e0b22" : colors.muted,
                          borderColor: p.featured ? "#f59e0b55" : colors.border,
                        },
                      ]}
                    >
                      <Feather
                        name="star"
                        size={11}
                        color={p.featured ? "#f59e0b" : colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.featuredText,
                          { color: p.featured ? "#f59e0b" : colors.mutedForeground },
                        ]}
                      >
                        {p.featured ? "Featured" : "Not featured"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {editing === p.id ? (
                <View style={styles.editArea}>
                  <View style={styles.editRow}>
                    <View style={styles.editField}>
                      <Text style={[styles.editLabel, { color: colors.mutedForeground }]}>
                        PRICE (৳)
                      </Text>
                      <TextInput
                        style={[
                          styles.editInput,
                          { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border },
                        ]}
                        value={editData.price}
                        onChangeText={(t) => setEditData((d) => ({ ...d, price: t }))}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>
                    <View style={styles.editField}>
                      <Text style={[styles.editLabel, { color: colors.mutedForeground }]}>
                        STOCK
                      </Text>
                      <TextInput
                        style={[
                          styles.editInput,
                          { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border },
                        ]}
                        value={editData.stock}
                        onChangeText={(t) => setEditData((d) => ({ ...d, stock: t }))}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>
                  </View>
                  <View style={styles.editActions}>
                    <Pressable
                      onPress={cancelEdit}
                      style={[styles.editCancelBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.editCancelText, { color: colors.mutedForeground }]}>
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => saveEdit(p)}
                      disabled={saving}
                      style={({ pressed }) => [
                        styles.editSaveBtn,
                        { backgroundColor: colors.primary, opacity: saving || pressed ? 0.75 : 1 },
                      ]}
                    >
                      {saving ? (
                        <ActivityIndicator size={14} color="#fff" />
                      ) : (
                        <>
                          <Feather name="check" size={14} color="#fff" />
                          <Text style={styles.editSaveText}>Save</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={[styles.priceLabel, { color: colors.primary }]}>
                      ৳{p.price.toLocaleString()}
                    </Text>
                    <Text style={[styles.stockLabel, { color: colors.mutedForeground }]}>
                      Stock: {p.stock}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => startEdit(p)}
                    style={[
                      styles.editBtn,
                      { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" },
                    ]}
                  >
                    <Feather name="edit-2" size={13} color={colors.primary} />
                    <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 2 },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  count: { fontSize: 14, fontFamily: "Inter_500Medium" },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 12, gap: 10 },
  card: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 10 },
  cardTop: { flexDirection: "row", gap: 10 },
  productImg: { width: 72, height: 72, borderRadius: 10 },
  productInfo: { flex: 1, gap: 6 },
  productName: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  metaRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  catBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  featuredToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  featuredText: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { fontSize: 18, fontFamily: "Inter_700Bold" },
  stockLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  editArea: { gap: 8 },
  editRow: { flexDirection: "row", gap: 10 },
  editField: { flex: 1, gap: 4 },
  editLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  editActions: { flexDirection: "row", gap: 8 },
  editCancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
  },
  editCancelText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  editSaveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    borderRadius: 10,
  },
  editSaveText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
