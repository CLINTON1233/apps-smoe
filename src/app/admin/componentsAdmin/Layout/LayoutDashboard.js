"use client";

import { useState, useEffect } from "react";
import {
  LogOut,
  LayoutDashboard as DashboardIcon,
  Store,
  Users,
  User,
  ChevronDown,
  Mail,
  Package,
  Phone,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function LayoutDashboard({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
    const { user, logout } = useAuth(); // Get user and logout from context
  const pathname = usePathname();

  // Close dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Ambil data user dari localStorage saat komponen mount
  useEffect(() => {
    const getUserData = () => {
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserData(user);
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      }
    };

    getUserData();
  }, []);

  // Konfigurasi SweetAlert untuk Dark Mode
  const swalDarkConfig = {
    background: "#1f2937",
    color: "#f3f4f6",
    iconColor: "#3b82f6",
    confirmButtonColor: "#4CAF50",
    cancelButtonColor: "#ef4444",
  };

   const handleLogout = () => {
    Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#1f2937",
      color: "#f3f4f6",
      iconColor: "#3b82f6",
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        logout(); // Use logout from context
        
        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#1f2937",
          color: "#f3f4f6",
          iconColor: "#10b981",
        });
      }
    });
  };

  const isActiveLink = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Active link styles untuk Dark Mode dengan icon
  const getActiveStyles = (href) => {
    return isActiveLink(href)
      ? "text-blue-400 font-semibold bg-gray-800 px-3 py-2 rounded-lg flex items-center gap-2"
      : "text-gray-300 hover:text-blue-400 hover:bg-gray-800 px-3 py-2 rounded-lg transition flex items-center gap-2";
  };

  // Mobile active link styles untuk Dark Mode
  const getMobileActiveStyles = (href) => {
    return isActiveLink(href)
      ? "bg-gray-800 text-blue-400 font-semibold border-l-4 border-blue-400"
      : "text-gray-300 hover:bg-gray-800";
  };

  // Daftar navigasi
  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/admin/management-app-store", label: "App Store", icon: Store },
    {
      href: "/admin/management-categories",
      label: "Categories",
      icon: Package,
    },
    { href: "/admin/management-users", label: "Users", icon: Users },
    { href: "/admin/profile", label: "Profile", icon: User },
  ];

  // Format role untuk display
  const formatRole = (role) => {
    const roleMap = {
      admin: "Admin",
      superadmin: "Superadmin",
      guest: "Guest",
      user: "Regular User",
    };
    return roleMap[role] || role;
  };

  // Get role color
  const getRoleColor = (role) => {
    const colorMap = {
      admin: "text-green-400 bg-green-900/30",
      superadmin: "text-purple-400 bg-purple-900/30",
      guest: "text-blue-400 bg-blue-900/30",
      user: "text-gray-400 bg-gray-700",
    };
    return colorMap[role] || "text-gray-400 bg-gray-700";
  };

  return (
    <div
      className={`min-h-screen bg-gray-900 text-gray-100 ${poppins.className}`}
    >
      {/* Header (Top Navbar) */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gray-800 text-white shadow-xl border-b border-gray-700">
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/seatrium_logo_white.png"
            alt="Seatrium Logo"
            width={180}
            height={180}
            className="object-contain w-28 sm:w-32 brightness-110"
          />
        </Link>

        <div className="flex items-center gap-0">
          {/* Desktop Navigation dengan Icon - Diperbaiki spacing */}
          <nav className="hidden sm:flex items-center gap-1 text-sm font-medium mr-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getActiveStyles(item.href)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop User Info & Dropdown */}
          <div className="hidden sm:flex items-center gap-2">
            {userData ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition border border-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white truncate max-w-[120px]">
                        {userData.nama || "No Name"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRole(userData.role)}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl py-3 z-50 border border-gray-700">
                    {/* User Header Info */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {userData.nama || "No Name"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                userData.role
                              )}`}
                            >
                              {formatRole(userData.role)}
                            </span>
                            {userData.badge && (
                              <span className="text-xs text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded">
                                {userData.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="px-4 py-3 space-y-2 border-b border-gray-700">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-xs">Email</p>
                          <p className="text-white truncate">
                            {userData.email}
                          </p>
                        </div>
                      </div>

                      {userData.departemen && (
                        <div className="flex items-center gap-3 text-sm">
                          <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">Department</p>
                            <p className="text-white truncate">
                              {userData.departemen}
                            </p>
                          </div>
                        </div>
                      )}

                      {userData.telp && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">Phone</p>
                            <p className="text-white truncate">
                              {userData.telp}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="px-2 py-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition w-full"
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition w-full mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Loading...</p>
                  <p className="text-xs text-gray-400">User data</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button & Dropdown */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition border border-gray-600 text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            <div className="absolute right-0 top-12 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-700">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-700">
                {userData ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {userData.nama || "No Name"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            userData.role === "admin" ||
                            userData.role === "superadmin"
                              ? "bg-green-900/50 text-green-400"
                              : "bg-blue-900/50 text-blue-400"
                          }`}
                        >
                          {formatRole(userData.role)}
                        </span>
                        {userData.badge && (
                          <span className="text-xs text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded">
                            {userData.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Loading...
                      </p>
                      <p className="text-xs text-gray-400">User data</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm ${getMobileActiveStyles(
                    item.href
                  )}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-3 mt-1 border-t border-gray-700"
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
