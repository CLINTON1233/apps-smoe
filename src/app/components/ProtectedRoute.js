// components/ProtectedRoute.js di AppsSMOE
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, verifyToken } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.log("No token found in localStorage");
          
          // Cek URL untuk token
          const urlParams = new URLSearchParams(window.location.search);
          const tokenFromUrl = urlParams.get("token");
          
          if (tokenFromUrl) {
            console.log("Found token in URL, processing...");
            // AuthContext akan handle ini
            return;
          }
          
          // Redirect ke Portal untuk login
          const returnUrl = encodeURIComponent(window.location.href);
          window.location.href = `http://localhost:3000/login?redirect=${returnUrl}`;
          return;
        }

        // Verify token dengan Portal backend
        const isValid = await verifyToken(token);
        
        if (!isValid) {
          console.log("Token invalid, clearing storage");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          // Redirect ke Portal untuk login
          const returnUrl = encodeURIComponent(window.location.href);
          window.location.href = `http://localhost:3000/login?redirect=${returnUrl}`;
          return;
        }

        setIsVerified(true);
        
        // Check role access
        if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        
        // Clear invalid tokens
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirect ke Portal untuk login
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `http://localhost:3000/login?redirect=${returnUrl}`;
      }
    };

    if (!loading) {
      if (!user) {
        checkAuth();
      } else {
        setIsVerified(true);
      }
    }
  }, [user, loading, allowedRoles, router, verifyToken]);

  if (loading || !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          <span className="mt-4 text-sm text-gray-300">
            Verifying session from Portal...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}