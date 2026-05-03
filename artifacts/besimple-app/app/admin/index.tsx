import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useColors } from "@/hooks/useColors";
import { adminFetch } from "@/utils/adminFetch";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  totalProducts: number;
  newLeads: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: number;
  customerName: string;
  city: string;
  status: string;
  total: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#3b82f6",
  processing: "#f59e0b",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await adminFetch<Stats>("/admin/stats");
      setStats(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const CARDS = stats
    ? [
        { label: "Total Orders", value: stats.totalOrders, icon: "shopping-bag" as const, color: "#3b82f6" },
        { label: "Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: "trending-up" as const, color: colors.primary },
        { label: "Pending", value: stats.pendingOrders, icon: "clock" as const, color: "#f59e0b" },
        { label: "Products", value: stats.totalProducts, icon: "package" as const, color: "#8b5cf6" },
        { label: "Processing", value: stats.processingOrders, icon: "truck" as const, color: "#06b6d4" },
        { label: "New Leads", value: stats.newLeads, icon: "users" as const, color: "#22c55e" },
      ]
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, borderBottomColor: colors.border },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Admin Panel</Text>
          <View style={[styles.liveBadge, { backgroundColor: "#22c55e22", borderColor: "#22c55e44" }]}>
            <View style={[styles.dot, { backgroundColor: "#22c55e" }]} />
            <Text style={[styles.liveText, { color: "#22c55e" }]}>Store Live</Text>
          </View>
        </View>
        <Pressable
          onPress={() => { logout(); router.back(); }}
          style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="log-out" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />
          }
        >
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>OVERVIEW</Text>
          <View style={styles.grid}>
            {CARDS.map((card) => (
              <View
                key={card.label}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={[styles.cardIcon, { backgroundColor: card.color + "22" }]}>
                  <Feather name={card.icon} size={18} color={card.color} />
                </View>
                <Text style={[styles.cardValue, { color: colors.foreground }]}>
                  {card.value}
                </Text>
                <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
                  {card.label}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MANAGE</Text>
          <View style={styles.navRow}>
            {[
              { label: "Orders", icon: "shopping-bag" as const, route: "/admin/orders" as const, count: stats?.totalOrders },
              { label: "Products", icon: "package" as const, route: "/admin/products" as const, count: stats?.totalProducts },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route)}
                style={({ pressed }) => [
                  styles.navCard,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <View style={[styles.navIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name={item.icon} size={22} color={colors.primary} />
                </View>
                <Text style={[styles.navLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.navCount, { color: colors.mutedForeground }]}>
                  {item.count} total
                </Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={styles.navArrow} />
              </Pressable>
            ))}
          </View>

          {stats && stats.recentOrders.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                RECENT ORDERS
              </Text>
              {stats.recentOrders.slice(0, 5).map((order) => (
                <Pressable
                  key={order.id}
                  onPress={() => router.push("/admin/orders")}
                  style={[
                    styles.orderRow,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.orderLeft}>
                    <Text style={[styles.orderName, { color: colors.foreground }]}>
                      {order.customerName}
                    </Text>
                    <Text style={[styles.orderMeta, { color: colors.mutedForeground }]}>
                      {order.city} · #{order.id}
                    </Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={[styles.orderTotal, { color: colors.primary }]}>
                      ৳{order.total.toLocaleString()}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: (STATUS_COLORS[order.status] ?? colors.mutedForeground) + "22",
                          borderColor: (STATUS_COLORS[order.status] ?? colors.mutedForeground) + "55",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: STATUS_COLORS[order.status] ?? colors.mutedForeground },
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </>
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  cardValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  cardLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  navRow: { gap: 8 },
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  navIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  navCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  navArrow: { marginLeft: 4 },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  orderLeft: { gap: 2 },
  orderName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  orderMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  orderRight: { alignItems: "flex-end", gap: 4 },
  orderTotal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
