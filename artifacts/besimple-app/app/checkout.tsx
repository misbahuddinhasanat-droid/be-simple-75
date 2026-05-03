import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name";
    if (!form.phone.trim()) return "Please enter your phone number";
    if (!form.address.trim()) return "Please enter your address";
    if (!form.city.trim()) return "Please enter your city";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Missing Info", error);
      return;
    }
    if (items.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));

      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name.trim(),
          email: form.email.trim() || `${form.phone.trim().replace(/\s/g, "")}@besimple75.com`,
          address: form.address.trim(),
          city: form.city.trim(),
          country: "Bangladesh",
          zipCode: form.zipCode.trim() || "1000",
          items: orderItems,
        }),
      });

      if (!res.ok) throw new Error("Order failed");
      const order = await res.json() as { id: number };

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      router.replace(`/order-success?orderId=${order.id}`);
    } catch {
      Alert.alert("Error", "Could not place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={16}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.codBadge,
            { backgroundColor: "#22c55e18", borderColor: "#22c55e44" },
          ]}
        >
          <Feather name="truck" size={14} color="#22c55e" />
          <Text style={[styles.codText, { color: "#22c55e" }]}>
            Cash on Delivery (COD)
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          DELIVERY INFO
        </Text>

        {([
          { key: "name", label: "Full Name *", placeholder: "Enter your name", icon: "user" },
          { key: "phone", label: "Phone / WhatsApp *", placeholder: "01XXXXXXXXX", icon: "phone" },
          { key: "email", label: "Email (optional)", placeholder: "your@email.com", icon: "mail" },
          { key: "address", label: "Delivery Address *", placeholder: "House, Road, Area", icon: "map-pin" },
          { key: "city", label: "City *", placeholder: "Dhaka", icon: "navigation" },
          { key: "zipCode", label: "ZIP Code", placeholder: "1212", icon: "hash" },
        ] as const).map(({ key, label, placeholder, icon }) => (
          <View key={key} style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
            <View
              style={[
                styles.inputWrap,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather name={icon} size={16} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground + "88"}
                value={form[key]}
                onChangeText={set(key)}
                autoCapitalize={key === "email" ? "none" : "words"}
                keyboardType={
                  key === "phone"
                    ? "phone-pad"
                    : key === "email"
                    ? "email-address"
                    : "default"
                }
              />
            </View>
          </View>
        ))}

        <View
          style={[
            styles.summaryBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
            Order Summary
          </Text>
          {items.map((item) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text
                style={[styles.summaryItem, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {item.productName} × {item.quantity}
              </Text>
              <Text style={[styles.summaryPrice, { color: colors.foreground }]}>
                ৳{(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ৳{total.toLocaleString()}
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: colors.primary, opacity: loading || pressed ? 0.75 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.submitText}>Confirm Order</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    gap: 14,
  },
  codBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  codText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 4,
  },
  field: { gap: 6 },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  summaryBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginTop: 6,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    marginRight: 8,
  },
  summaryPrice: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
