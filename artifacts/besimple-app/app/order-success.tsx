import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function OrderSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: "#22c55e18", borderColor: "#22c55e44" },
          ]}
        >
          <Feather name="check" size={48} color="#22c55e" />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Order Placed!</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your order has been confirmed. We'll call you to confirm delivery.
        </Text>

        {orderId && (
          <View
            style={[
              styles.orderBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.orderLabel, { color: colors.mutedForeground }]}>
              ORDER ID
            </Text>
            <Text style={[styles.orderId, { color: colors.primary }]}>#{orderId}</Text>
          </View>
        )}

        <View style={styles.steps}>
          {[
            { icon: "phone" as const, text: "We'll call to confirm" },
            { icon: "truck" as const, text: "Delivery in 1-3 business days" },
            { icon: "credit-card" as const, text: "Cash on Delivery (COD)" },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name={icon} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.replace("/(tabs)/")}
          style={({ pressed }) => [
            styles.shopBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="shopping-bag" size={18} color="#fff" />
          <Text style={styles.shopBtnText}>Continue Shopping</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  orderBox: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  orderLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  orderId: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  steps: {
    gap: 12,
    width: "100%",
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  shopBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
