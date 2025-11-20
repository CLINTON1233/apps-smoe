"use client";

import { useState } from "react";
import { LogOut, LayoutDashboard as DashboardIcon, Store, Users, User } from "lucide-react"; // Menambahkan icon untuk navigasi
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

  // Konfigurasi SweetAlert untuk Dark Mode
  const swalDarkConfig = {
    background: "#1f2937", // Warna gelap untuk latar belakang SweetAlert
    color: "#f3f4f6", // Warna terang untuk teks SweetAlert
    iconColor: "#3b82f6", // Warna icon
    confirmButtonColor: "#4CAF50", // Warna tombol konfirmasi (biru)
    cancelButtonColor: "#ef4444", // Warna tombol batal (merah)
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Anda yakin ingin keluar dari akun Anda?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      ...swalDarkConfig, // Terapkan konfigurasi dark mode
    }).then((result) => {
      if (result.isConfirmed) {
        if (typeof window !== "undefined") {
          Swal.fire({
            title: "Berhasil Keluar!",
            text: "Anda telah berhasil keluar.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            ...swalDarkConfig, // Terapkan konfigurasi dark mode
          }).then(() => {
            window.location.href = "/login";
          });
        }
      }
    });
  };

  const isActiveLink = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Active link styles untuk Dark Mode
  const getActiveStyles = (href) => {
    return isActiveLink(href)
      ? "text-blue-400 font-semibold bg-gray-800 px-3 py-2 rounded-lg"
      : "text-gray-300 hover:text-blue-400 hover:bg-gray-800 px-3 py-2 rounded-lg transition";
  };

  // Mobile active link styles untuk Dark Mode
  const getMobileActiveStyles = (href) => {
    return isActiveLink(href)
      ? "bg-gray-800 text-blue-400 font-semibold border-l-4 border-blue-400"
      : "text-gray-300 hover:bg-gray-800";
  };

  // Daftar navigasi
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/management-app-store", label: "App Store", icon: Store },
    { href: "/management-users", label: "Users", icon: Users },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div
      className={`min-h-screen bg-gray-900 text-gray-100 ${poppins.className}`} 
    >
      {/* Header (Top Navbar) */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gray-800 text-white shadow-xl border-b border-gray-700"> {/* Header gelap */}
    

     <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
         
          <Image
            src="/seatrium_logo_white.png" 
            alt="Seatrium Logo"
            width={180}
            height={180}
            className="object-contain w-28 sm:w-32 brightness-110" 
          />
        </Link>
        {/* <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
  <div className="text-1xl sm:text-1xl font-semibold tracking-wide text-blue-400">
    Seatrium<span className="text-white">Apps</span>
  </div>
</Link> */}


        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-2 lg:gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getActiveStyles(item.href)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-red-400 hover:bg-gray-800 px-3 py-2 rounded-lg transition flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
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
            <div className="absolute right-0 top-12 mt-2 w-52 bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-700"> {/* Mobile menu gelap */}
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm font-semibold text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin</p>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm ${getMobileActiveStyles(item.href)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 mt-1 border-t border-gray-700"
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