// app/page.js di AppsSMOE
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAndRedirect = () => {
      // Cek URL parameters terlebih dahulu
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      const userFromUrl = urlParams.get("user");

      // Jika ada token dari URL (datang dari Portal)
      if (tokenFromUrl && userFromUrl) {
        console.log("📥 Processing redirect from Portal...");
        
        // Simpan ke localStorage
        localStorage.setItem("token", tokenFromUrl);
        localStorage.setItem("user", userFromUrl);
        
        try {
          const userData = JSON.parse(decodeURIComponent(userFromUrl));
          userData.token = tokenFromUrl;
          localStorage.setItem("user", JSON.stringify(userData));
          
          // Hapus parameter dari URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          // Redirect berdasarkan role
          if (userData.role === "admin" || userData.role === "superadmin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/user/dashboard");
          }
        } catch (error) {
          console.error("Error processing redirect:", error);
          window.location.href = "http://localhost:3000/login";
        }
        return;
      }

      // Jika tidak ada di URL, coba dari localStorage
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      // if (token && storedUser) {
      //   try {
      //     const userData = JSON.parse(storedUser);
          
      //     if (userData.role === "admin" || userData.role === "superadmin") {
      //       router.push("/admin/dashboard");
      //     } else {
      //       router.push("/user/dashboard");
      //     }
      //   } catch (error) {
      //     console.error("Error parsing user data:", error);
      //     window.location.href = "http://localhost:3000/login";
      //   }
      // } else {
      //   console.log("No token found, redirecting to Portal...");
      //   window.location.href = "http://localhost:3000/login";
      // }

       if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // HANYA superadmin dan admin yang boleh masuk
        if (userData.role === "admin" || userData.role === "superadmin") {
          router.push("/admin/dashboard");
        } else {
          // Jika role bukan admin/superadmin, logout dan redirect ke portal
          console.log("Invalid role. Redirecting to Portal...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "http://localhost:3000/login";
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        window.location.href = "http://localhost:3000/login";
      }
    } else {
      console.log("No token found, redirecting to Portal...");
      window.location.href = "http://localhost:3000/login";
    }
    };

    checkAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        <span className="mt-4 text-sm text-gray-300">
          Processing authentication...
        </span>
      </div>
    </div>
  );
}