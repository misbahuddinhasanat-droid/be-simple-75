import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useColors } from "@/hooks/useColors";

interface StoreInfo {
  whatsappNumber: string;
  whatsappUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  facebookUrl: string;
  email: string;
  policyReturn: string;
  policyDelivery: string;
  policyPayment: string;
}

const DEFAULTS: StoreInfo = {
  whatsappNumber: "+880 1XXXXXXXXX",
  whatsappUrl: "https://wa.me/8801000000000",
  instagramHandle: "@besimple75bd",
  instagramUrl: "https://instagram.com/besimple75bd",
  facebookUrl: "https://facebook.com/besimple75",
  email: "support@besimple75.com",
  policyReturn: "7-day return on unworn items",
  policyDelivery: "Dhaka: 1-2 days · Outside: 3-5 days",
  policyPayment: "Cash on Delivery (COD)",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();

  const [info, setInfo] = useState<StoreInfo>(DEFAULTS);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json() as { storeInfo?: Partial<StoreInfo> };
      if (data.storeInfo) {
        setInfo(prev => ({ ...prev, ...data.storeInfo }));
      }
    } catch { /* use defaults */ }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const LINKS = [
    {
      icon: "phone" as const,
      label: "WhatsApp Order",
      sub: info.whatsappNumber || "Chat with us for custom orders",
      onPress: () => Linking.openURL(info.whatsappUrl || DEFAULTS.whatsappUrl),
    },
    {
      icon: "instagram" as const,
      label: "Follow on Instagram",
      sub: info.instagramHandle,
      onPress: () => Linking.openURL(info.instagramUrl || DEFAULTS.instagramUrl),
    },
    {
      icon: "facebook" as const,
      label: "Facebook Page",
      sub: "Latest drops & announcements",
      onPress: () => Linking.openURL(info.facebookUrl || DEFAULTS.facebookUrl),
    },
    {
      icon: "mail" as const,
      label: "Contact Us",
      sub: info.email,
      onPress: () => Linking.openURL(`mailto:${info.email || DEFAULTS.email}`),
    },
  ];

  const POLICIES = [
    { label: "Return Policy", detail: info.policyReturn },
    { label: "Delivery", detail: info.policyDelivery },
    { label: "Payment", detail: info.policyPayment },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" },
          ]}
        >
          <Text style={[styles.logoText, { color: colors.primary }]}>BS</Text>
        </View>
        <Text style={[styles.brandName, { color: colors.foreground }]}>
          BE SIMPLE <Text style={{ color: colors.primary }}>75</Text>
        </Text>
        <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>
          Bangladesh's Finest Streetwear
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          CONNECT WITH US
        </Text>
        {LINKS.map((link) => (
          <Pressable
            key={link.label}
            onPress={link.onPress}
            style={({ pressed }) => [
              styles.linkRow,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={[styles.linkIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name={link.icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkLabel, { color: colors.foreground }]}>{link.label}</Text>
              <Text style={[styles.linkSub, { color: colors.mutedForeground }]}>{link.sub}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          STORE POLICIES
        </Text>
        {POLICIES.map((p) => (
          <View
            key={p.label}
            style={[
              styles.policyRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="check-circle" size={14} color={colors.primary} />
            <View style={styles.policyInfo}>
              <Text style={[styles.policyLabel, { color: colors.foreground }]}>{p.label}</Text>
              <Text style={[styles.policyDetail, { color: colors.mutedForeground }]}>{p.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.section, { paddingTop: 0 }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          ADMIN
        </Text>
        <Pressable
          onPress={() => router.push(isAdmin ? "/admin/" : "/admin/login")}
          style={({ pressed }) => [
            styles.adminBtn,
            {
              backgroundColor: colors.primary + "18",
              borderColor: colors.primary + "44",
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View style={[styles.adminIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="shield" size={20} color={colors.primary} />
          </View>
          <View style={styles.linkInfo}>
            <Text style={[styles.linkLabel, { color: colors.primary }]}>
              {isAdmin ? "Admin Dashboard" : "Admin Panel"}
            </Text>
            <Text style={[styles.linkSub, { color: colors.mutedForeground }]}>
              {isAdmin ? "Manage orders & products" : "Sign in to manage store"}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </Pressable>
      </View>

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        © 2025 Be Simple 75 · Made in Bangladesh 🇧🇩
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    gap: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  section: {
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  linkInfo: { flex: 1 },
  linkLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  linkSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  policyInfo: { flex: 1 },
  policyLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  policyDetail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    paddingVertical: 24,
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  adminIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
