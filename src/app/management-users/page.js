"use client";

import { useState } from "react";
import { Search, Download, User, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function AppStoreDashboard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = [
    "All",
    "Business",
    "Education",
    "Entertainment",
    "Games",
    "Productivity",
    "Utilities",
  ];

  const apps = [
    {
      id: 1,
      name: "Tokopedia",
      version: "v3.12.1",
      description: "Online shopping platform with millions of products",
      downloads: "10M+",
      size: "85 MB",
      category: "Business",
      rating: 4.8,
      icon: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "Shopee",
      version: "v2.45.0",
      description: "Leading e-commerce app in Southeast Asia",
      downloads: "50M+",
      size: "92 MB",
      category: "Business",
      rating: 4.7,
      icon: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "Gojek",
      version: "v4.32.5",
      description: "Super app for transportation, food delivery & payments",
      downloads: "100M+",
      size: "78 MB",
      category: "Productivity",
      rating: 4.6,
      icon: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 4,
      name: "Spotify",
      version: "v8.8.96",
      description: "Music streaming with millions of songs and podcasts",
      downloads: "500M+",
      size: "65 MB",
      category: "Entertainment",
      rating: 4.9,
      icon: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 5,
      name: "Zoom",
      version: "v5.17.0",
      description: "Video conferencing and online meetings",
      downloads: "300M+",
      size: "120 MB",
      category: "Productivity",
      rating: 4.5,
      icon: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 6,
      name: "Netflix",
      version: "v8.102.0",
      description: "Stream TV shows, movies, and original content",
      downloads: "1B+",
      size: "45 MB",
      category: "Entertainment",
      rating: 4.8,
      icon: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 7,
      name: "Duolingo",
      version: "v5.101.3",
      description: "Learn languages with fun, bite-sized lessons",
      downloads: "200M+",
      size: "35 MB",
      category: "Education",
      rating: 4.7,
      icon: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 8,
      name: "WhatsApp",
      version: "v2.23.25",
      description: "Simple, reliable messaging and calling",
      downloads: "5B+",
      size: "42 MB",
      category: "Utilities",
      rating: 4.4,
      icon: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=80&h=80&fit=crop&crop=center",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${poppins.className}`}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white shadow-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/seatrium.png"
            alt="Seatrium Logo"
            width={120}
            height={120}
            className="object-contain w-28 sm:w-32"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-4 lg:gap-6 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-gray-200 transition whitespace-nowrap">
            Dashboard
          </Link>
          <Link href="/management-app-store" className="hover:text-gray-200 transition whitespace-nowrap">
            App Store
          </Link>
          <Link href="/management-users" className="hover:text-gray-200 transition whitespace-nowrap">
            Users
          </Link>
          <Link href="/profile" className="hover:text-gray-200 transition whitespace-nowrap">
            Profile
          </Link>
          <button className="hover:text-gray-200 transition whitespace-nowrap">Logout</button>
        </nav>

        {/* Mobile Menu */}
        <div className="sm:hidden relative">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md bg-blue-600 hover:bg-blue-500 transition"
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

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
              <Link 
                href="/dashboard" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/management-app-store" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                App Store
              </Link>
              <Link 
                href="/management-users" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                User Management
              </Link>
              <Link 
                href="/profile" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

   

     
    </div>
  );
}