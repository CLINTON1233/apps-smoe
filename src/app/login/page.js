"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const API_BASE_URL = "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check jika user sudah login
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // PERBAIKI: Tambahkan pengecekan untuk guest
          if (userData.role === "admin" || userData.role === "superadmin") {
            router.push("/admin/dashboard");
          } else if (userData.role === "user" || userData.role === "guest") {
            router.push("/user/dashboard");
          }
        } catch (error) {
          setCheckingAuth(false);
        }
      } else {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Login attempt:", formData);

      if (!formData.email || !formData.password) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all fields",
          icon: "error",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#f9fafb",
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === "success") {
        const userData = result.data.user;
        localStorage.setItem("user", JSON.stringify(userData));

        // Use context login function
        login(userData);
        
        Swal.fire({
          title: "Success!",
          text: "Login successful!",
          icon: "success",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#f9fafb",
        });

        // PERBAIKI: Tidak perlu setTimeout karena AuthContext sudah handle redirect
        // Biarkan AuthContext yang handle redirect
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        title: "Login Failed",
        text: error.message || "Invalid email or password",
        icon: "error",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          <span className="mt-4 text-sm text-gray-300">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen flex flex-col ${poppins.className}`}>
      {/* 🌑 DARK BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-95" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700 text-white">
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/seatrium_logo_white.png"
            alt="Seatrium Logo"
            width={180}
            height={180}
            className="object-contain w-28 sm:w-32 brightness-110"
          />
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 mt-[-30px]">
        <div className="max-w-md w-full">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-0">
              Welcome Back!
            </h1>
            <p className="text-gray-400 text-lg">
              Log in to access your account
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-2xl p-8 shadow-2xl"
          >
            {/* Form Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Log in</h2>
              <div className="w-12 h-1 bg-blue-500 mx-auto mt-3 rounded-full"></div>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-3"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                  disabled={loading}
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-3.5 text-base font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-400 text-sm border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <p>IT Applications Dashboard</p>
          <p className="mt-1">
            <Link
              href="https://seatrium.com"
              target="_blank"
              className="text-blue-400 hover:text-blue-300 transition"
            >
              seatrium.com
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}