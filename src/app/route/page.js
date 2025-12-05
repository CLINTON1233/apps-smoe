"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === "superadmin") {
          router.push("/superadmin/dashboard");
        } else if (userData.role === "admin") {
          router.push("/admin/dashboard");
        } else if (userData.role === "user") {
          router.push("/user/dashboard");
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        <span className="mt-4 text-sm text-gray-300">Redirecting...</span>
      </div>
    </div>
  );
}