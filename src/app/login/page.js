"use client";

import { useState } from "react";
import { Search, Download, User, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AppStoreDashboard() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  
  const categories = [
    "Semua",
    "Business",
    "Education",
    "Entertainment",
    "Games",
    "Productivity",
    "Utilities"
  ];

  const apps = [
    {
      id: 1,
      name: "Tokped",
      version: "v1.0.0",
      description: "Tokped",
      downloads: 0,
      size: "10 Bytes",
      category: "Education",
      icon: "https://via.placeholder.com/80?text=T"
    },
    {
      id: 2,
      name: "Shopee",
      version: "v2.1.0",
      description: "Shopping Application",
      downloads: 150,
      size: "25 MB",
      category: "Business",
      icon: "https://via.placeholder.com/80?text=S"
    },
    {
      id: 3,
      name: "Gojek",
      version: "v3.5.2",
      description: "Transportation App",
      downloads: 500,
      size: "45 MB",
      category: "Productivity",
      icon: "https://via.placeholder.com/80?text=G"
    },
    {
      id: 4,
      name: "Spotify",
      version: "v1.8.0",
      description: "Music Streaming",
      downloads: 1200,
      size: "35 MB",
      category: "Entertainment",
      icon: "https://via.placeholder.com/80?text=SP"
    }
  ];

  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Diperbaiki seperti di halaman login */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo seperti di halaman login */}
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

            {/* Admin Login Button */}
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <User size={20} />
              <span className="font-medium">Admin Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari aplikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter size={18} />
            <span className="font-medium">Kategori:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-20 h-20 rounded-2xl mb-4 object-cover"
                />
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{app.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{app.version}</p>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.description}</p>
                
                <div className="flex items-center justify-between w-full mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Download size={14} />
                    <span>{app.downloads}</span>
                  </div>
                  <span>{app.size}</span>
                </div>

                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mb-4">
                  {app.category}
                </span>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Result Info */}
        <div className="text-center text-gray-500 py-4">
          Menampilkan {filteredApps.length} dari {apps.length} aplikasi
        </div>
      </div>

      {/* Footer - SAMA PERSIS seperti di halaman login */}
      <footer className="mt-auto py-4 text-center text-white text-xs md:text-sm space-y-1 border-t border-white/30 bg-blue-900">
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