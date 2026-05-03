import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { adminFetch } from "@/utils/adminFetch";

interface Order {
  id: number;
  customerName: string;
  email: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  status: string;
  total: number;
  items: unknown[];
  createdAt: string;
}

const STATUSES = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
const FILTERS = ["all", ...STATUSES];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#3b82f6",
  processing: "#f59e0b",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export default function AdminOrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<number | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const q = filter !== "all" ? `?status=${filter}` : "";
      const data = await adminFetch<Order[]>(`/admin/orders${q}`);
      setOrders(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = (order: Order) => {
    const options = STATUSES.filter((s) => s !== order.status);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Order #${order.id} — ${order.customerName}`,
          message: "Update status",
          options: [...options, "Cancel"],
          cancelButtonIndex: options.length,
          destructiveButtonIndex: options.indexOf("cancelled"),
        },
        async (idx) => {
          if (idx === options.length) return;
          await applyStatus(order.id, options[idx]);
        },
      );
    } else {
      Alert.alert(
        `Order #${order.id}`,
        "Update status to:",
        [
          ...options.map((s) => ({
            text: s.charAt(0).toUpperCase() + s.slice(1),
            onPress: () => applyStatus(order.id, s),
          })),
          { text: "Cancel", style: "cancel" as const },
        ],
      );
    }
  };

  const applyStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const updated = await adminFetch<Order>(`/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Orders</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {orders.length}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterPill,
              {
                backgroundColor: filter === f ? colors.primary : colors.card,
                borderColor: filter === f ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? "#fff" : colors.mutedForeground },
              ]}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

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
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="inbox" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No orders
              </Text>
            </View>
          ) : (
            filtered.map((order) => (
              <View
                key={order.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardTop}>
                  <View>
                    <Text style={[styles.name, { color: colors.foreground }]}>
                      {order.customerName}
                    </Text>
                    <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                      #{order.id} · {order.city} · {new Date(order.createdAt).toLocaleDateString("en-BD")}
                    </Text>
                    <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                      {order.address}
                    </Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={[styles.total, { color: colors.primary }]}>
                      ৳{order.total.toLocaleString()}
                    </Text>
                    <Text style={[styles.itemCount, { color: colors.mutedForeground }]}>
                      {(order.items as unknown[]).length} item(s)
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: (STATUS_COLORS[order.status] ?? "#888") + "22",
                        borderColor: (STATUS_COLORS[order.status] ?? "#888") + "55",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: STATUS_COLORS[order.status] ?? "#888" },
                      ]}
                    >
                      {order.status.toUpperCase()}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => updateStatus(order)}
                    disabled={updating === order.id}
                    style={({ pressed }) => [
                      styles.updateBtn,
                      {
                        backgroundColor: colors.primary + "18",
                        borderColor: colors.primary + "55",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    {updating === order.id ? (
                      <ActivityIndicator size={12} color={colors.primary} />
                    ) : (
                      <>
                        <Feather name="edit-2" size={12} color={colors.primary} />
                        <Text style={[styles.updateText, { color: colors.primary }]}>
                          Update
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            ))
          )}
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
  filterScroll: { flexGrow: 0, paddingVertical: 10 },
  filterContent: { gap: 8, paddingHorizontal: 16, flexDirection: "row" },
  filterPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 12, gap: 10 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  cardRight: { alignItems: "flex-end" },
  total: { fontSize: 16, fontFamily: "Inter_700Bold" },
  itemCount: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  updateText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
