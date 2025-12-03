"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Check authentication on route change
    if (!loading) {
      checkRouteAccess();
    }
  }, [pathname, loading]);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkRouteAccess = () => {
    // Public routes (bisa diakses tanpa login)
    const publicRoutes = ["/login", "/"];

    if (loading) return;

    // Jika belum login dan mencoba akses protected route
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/login");
      return;
    }

    // Jika sudah login tapi mencoba akses login page
    if (user && pathname === "/login") {
      redirectBasedOnRole();
      return;
    }

    // Check role-based access untuk protected routes
    if (user && !checkRoleAccess(pathname, user.role)) {
      // Redirect ke dashboard sesuai role
      redirectBasedOnRole();
    }
  };

  const checkRoleAccess = (path, userRole) => {
    // Superadmin dan admin bisa akses semua routes admin
    if (userRole === "superadmin" || userRole === "admin") {
      // Hanya boleh akses routes admin
      if (path.startsWith("/admin")) {
        return true;
      }
      // Jika mencoba akses user routes, redirect ke admin
      if (path.startsWith("/user")) {
        return false;
      }
      // Untuk routes root, arahkan ke admin dashboard
      if (path === "/") {
        return false;
      }
    }

    // User biasa hanya bisa akses user routes
  if (userRole === "user" || userRole === "guest") {
      // Hanya boleh akses routes user
      if (path.startsWith("/user")) {
        return true;
      }
      // Jika mencoba akses admin routes, redirect ke user dashboard
      if (path.startsWith("/admin")) {
        return false;
      }
      // Untuk routes root, arahkan ke user dashboard
      if (path === "/") {
        return false;
      }
    }

    // Default: allow access
    return true;
  };

  const redirectBasedOnRole = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "superadmin" || user.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  };

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    redirectBasedOnRole();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("loginSuccessShown");
    router.push("/login");
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};