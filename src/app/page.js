"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulasi login berhasil
    console.log("Login attempt:", formData);
    
    // Redirect ke dashboard
    router.push("/dashboard");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={`relative min-h-screen flex flex-col ${poppins.className}`}>
      {/* 🌊 BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/banner.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white-700/50 via-white-500/30 to-gray-700/40" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/50 text-white">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm hover:text-gray-200 transition"
          >
            <Image
              src="/seatrium.png"
              alt="Seatrium Logo"
              width={150}
              height={150}
              className="object-contain"
            />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg w-full mx-auto px-4 py-10">
        {/* Title di atas form */}
        <div className="flex flex-col items-center mb-6 text-center text-white">
          <h1 className="text-3xl font-bold mb-0">Welcome Back!</h1>
          <p className="text-base opacity-90">Log in to access your account</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg mt-6"
        >
          {/* Title di dalam form */}
          <div className="flex flex-col items-center mb-6 text-center text-black">
            <h3 className="text-3xl font-bold mb-1">Log in</h3>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-base text-gray-700 mb-2"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-md text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-base text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-md text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-800 text-white rounded-full py-3 text-base font-medium hover:bg-blue-900 transition"
          >
            Log in
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-700">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>

      <footer className="mt-auto py-4 text-center text-white text-xs md:text-sm space-y-1 border-t border-white/30">
        <p>
          IT Applications Dashboard
        </p>
        <Link
          href="https://seatrium.com"
          target="_blank"
          className="underline hover:opacity-100"
        >
          seatrium.com
        </Link>
      </footer>
    </div>
  );
}