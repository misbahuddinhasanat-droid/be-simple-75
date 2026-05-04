import { useEffect } from "react";
import { useLocation } from "wouter";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const key = localStorage.getItem("admin_auth");
    if (key !== "Besimple90@@") {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const key = localStorage.getItem("admin_auth");
  if (key !== "Besimple90@@") return null;

  return <>{children}</>;
}
