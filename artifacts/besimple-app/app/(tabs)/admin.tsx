import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useColors } from "@/hooks/useColors";

export default function AdminTabRedirect() {
  const { isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;
    if (isAdmin) {
      router.replace("/admin/");
    } else {
      router.replace("/admin/login");
    }
  }, [isAdmin, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
