// context/AuthContext.js di AppsSMOE
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
    if (!loading) {
      checkRouteAccess();
    }
  }, [pathname, loading]);

  const checkAuth = () => {
    try {
      // Cek apakah ada token di URL (datang dari Portal)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      const userFromUrl = urlParams.get("user");

      // Jika ada token dari URL, simpan ke localStorage
      if (tokenFromUrl && userFromUrl) {
        console.log("📥 Token received from Portal URL");
        
        localStorage.setItem("token", tokenFromUrl);
        localStorage.setItem("user", userFromUrl);
        
        try {
          const userObj = JSON.parse(decodeURIComponent(userFromUrl));
          userObj.token = tokenFromUrl;
          setUser(userObj);
          console.log("✅ User loaded from Portal URL");
          
          // Hapus parameter dari URL tanpa reload halaman
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing user from URL:", error);
        }
      }

      // Jika tidak ada di URL, coba dari localStorage
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.token = token;
        setUser(userObj);
        console.log("✅ User loaded from localStorage:", userObj.email);
      } else {
        console.log("⚠️ No token found");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkRouteAccess = () => {
    const publicRoutes = ["/", "/verify-token"];

    if (loading) return;

    // Jika user belum login dan mencoba akses protected route
    if (!user && !publicRoutes.includes(pathname)) {
      console.log("🔒 No user, checking if we can get token from Portal...");
      
      // Coba redirect ke Portal untuk login
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `http://localhost:3000/login?redirect=${returnUrl}`;
      return;
    }

    // Jika user sudah login tapi di root path, redirect ke dashboard sesuai role
    if (user && pathname === "/") {
      redirectBasedOnRole();
      return;
    }

    // Check role-based access
    if (user && !checkRoleAccess(pathname, user.role)) {
      // Redirect ke dashboard sesuai role
      redirectBasedOnRole();
    }
  };

  const checkRoleAccess = (path, userRole) => {
    // Superadmin bisa akses semua routes
    if (userRole === "superadmin") {
      if (path.startsWith("/superadmin")) return true;
      if (path.startsWith("/admin")) return true;
      if (path.startsWith("/user")) return false;
      if (path === "/") return false;
      return true;
    }

    // Admin bisa akses admin routes (tidak bisa akses superadmin)
    if (userRole === "admin") {
      if (path.startsWith("/superadmin")) return false;
      if (path.startsWith("/admin")) return true;
      if (path.startsWith("/user")) return false;
      if (path === "/") return false;
      return true;
    }

    // User biasa bisa akses user routes
    if (userRole === "user") {
      if (path.startsWith("/superadmin")) return false;
      if (path.startsWith("/admin")) return false;
      if (path.startsWith("/user")) return true;
      if (path === "/") return false;
      return true;
    }

    return false;
  };

  const redirectBasedOnRole = () => {
    if (!user) {
      window.location.href = "http://localhost:3000/login";
      return;
    }

    if (user.role === "superadmin") {
      router.push("/superadmin/dashboard");
    } else if (user.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  };

  const login = (userData) => {
    console.log("Login should be done from Portal");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("loginSuccessShown");
    
    // Redirect ke Portal untuk login
    window.location.href = "http://localhost:3000/login";
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch("http://localhost:4000/users/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.status === "valid";
      }
      return false;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    verifyToken,
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