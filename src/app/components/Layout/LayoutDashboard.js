"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import Swal from "sweetalert2";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function LayoutDashboard({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout from your account?",
      icon: "warning",
      iconColor: "#f59e0b",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      color: "#1f2937",
      customClass: {
        title: "text-xl font-semibold text-gray-800",
        htmlContainer: "text-gray-600",
        confirmButton: "px-4 py-2 rounded-lg font-medium",
        cancelButton: "px-4 py-2 rounded-lg font-medium",
      },
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        if (typeof window !== "undefined") {
          Swal.fire({
            title: "Logged Out!",
            text: "You have been successfully logged out.",
            icon: "success",
            iconColor: "#10b981",
            confirmButtonColor: "#16a34a",
            background: "#ffffff",
            color: "#1f2937",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "/login";
          });
        }
      }
    });
  };

  // Function to check if a link is active
  const isActiveLink = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Active link styles
  const getActiveStyles = (href) => {
    return isActiveLink(href)
      ? "text-blue-600 font-semibold bg-blue-50 px-3 py-2 rounded-lg"
      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg transition";
  };

  // Mobile active link styles
  const getMobileActiveStyles = (href) => {
    return isActiveLink(href)
      ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600"
      : "text-gray-700 hover:bg-gray-100";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${poppins.className}`}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white text-black shadow-md">
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/seatrium.png"
            alt="Seatrium Logo"
            width={180}
            height={180}
            className="object-contain w-28 sm:w-32"
          />
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-2 lg:gap-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className={getActiveStyles("/dashboard")}
            >
              Dashboard
            </Link>
            <Link
              href="/management-app-store"
              className={getActiveStyles("/management-app-store")}
            >
              App Store
            </Link>
            <Link
              href="/management-users"
              className={getActiveStyles("/management-users")}
            >
              Users
            </Link>
            <Link 
              href="/profile" 
              className={getActiveStyles("/profile")}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg transition flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        </div>

        <div className="sm:hidden relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md bg-white hover:bg-gray-100 transition border border-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {isMobileMenuOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-gray-500">admin</p>
              </div>
              <Link
                href="/dashboard"
                className={`block px-4 py-2 ${getMobileActiveStyles("/dashboard")}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/management-app-store"
                className={`block px-4 py-2 ${getMobileActiveStyles("/management-app-store")}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                App Store
              </Link>
              <Link
                href="/management-users"
                className={`block px-4 py-2 ${getMobileActiveStyles("/management-users")}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                User Management
              </Link>
              <Link
                href="/profile"
                className={`block px-4 py-2 ${getMobileActiveStyles("/profile")}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}