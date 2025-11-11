"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    telp: "",
    departemen: "",
    badge: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle register logic here
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/50 via-blue-500/30 to-gray-700/40" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/50 text-white">
        {/* Logo */}
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

        {/* Login Text (kanan) */}
        <div>
          <Link
            href="/login"
            className="text-sm font-semibold hover:text-gray-200 tracking-wide transition"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg w-full mx-auto px-4 py-12 mt-6">
        {/* Title di atas form */}
        <div className="flex flex-col items-center mb-8 text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Create Account!</h1>
          <p className="text-sm opacity-90">Sign up to get started</p>
        </div>

        {/* Register Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg mt-8"
        >
          {/* Title di dalam form */}
          <div className="flex flex-col items-center mb-4 text-center text-black">
            <h3 className="text-xl font-bold mb-1">Sign Up</h3>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="nama"
              className="block text-sm text-gray-700 mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-gray-700 mb-2"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="telp"
              className="block text-sm text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="telp"
              name="telp"
              value={formData.telp}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="departemen"
              className="block text-sm text-gray-700 mb-2"
            >
              Department
            </label>
            <input
              type="text"
              id="departemen"
              name="departemen"
              value={formData.departemen}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Badge/Employee ID */}
          <div>
            <label
              htmlFor="badge"
              className="block text-sm text-gray-700 mb-2"
            >
              Badge/Employee ID
            </label>
            <input
              type="text"
              id="badge"
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-sm text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-600 hover:underline"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="confirmPassword" className="text-sm text-gray-700">
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-800 text-white rounded-full py-2 text-sm font-medium hover:bg-blue-900 transition mt-2"
          >
            Create Account
          </button>

          {/* Login link */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-700">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <footer className="mt-auto py-4 text-center text-white text-xs md:text-sm space-y-1 border-t border-white/30">
        <p>
          IT Infrastructure Dashboard
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