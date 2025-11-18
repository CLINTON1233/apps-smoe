"use client";

import { useState } from "react";
import { Search, Download, Filter } from "lucide-react";
import LayoutDashboard from "../components/Layout/LayoutDashboard";

export default function AdminDashboard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
      name: "Zoom",
      version: "v5.16.0",
      description: "Video conferencing and online meetings",
      downloads: "500M+",
      size: "120 MB",
      category: "Business",
      rating: 4.5,
      icon: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "Netflix",
      version: "v8.12.0",
      description: "Stream movies and TV shows",
      downloads: "1B+",
      size: "95 MB",
      category: "Entertainment",
      rating: 4.7,
      icon: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 4,
      name: "Duolingo",
      version: "v5.101.2",
      description: "Learn languages for free",
      downloads: "500M+",
      size: "65 MB",
      category: "Education",
      rating: 4.6,
      icon: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 5,
      name: "Spotify",
      version: "v8.8.0",
      description: "Music streaming service",
      downloads: "500M+",
      size: "75 MB",
      category: "Entertainment",
      rating: 4.8,
      icon: "https://images.unsplash.com/photo-1611339555312-e810c9d6d13f?w=80&h=80&fit=crop&crop=center",
    },
    {
      id: 6,
      name: "Microsoft Word",
      version: "v16.0",
      description: "Word processing application",
      downloads: "1B+",
      size: "450 MB",
      category: "Productivity",
      rating: 4.7,
      icon: "https://images.unsplash.com/photo-1649180556628-9ba704115875?w=80&h=80&fit=crop&crop=center",
    }
  ];

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <LayoutDashboard>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your administration panel</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-black placeholder-black border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-black">
              <Filter size={16} className="text-blue-600" />
              <span className="font-semibold">Categories:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-blue-700 text-white border-blue-700 shadow-md"
                      : "bg-white text-black border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div className="flex justify-center mb-3">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center">
                {app.name}
              </h3>
              <div className="flex gap-2 justify-center mt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {app.version}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {app.size}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center line-clamp-2">
                {app.description}
              </p>
              <span className="mt-3 mx-auto bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                {app.category}
              </span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-6 hover:bg-blue-700 transition">
                Download
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 mt-6">
          Showing {filteredApps.length} of {apps.length} applications
        </p>
      </div>
    </LayoutDashboard>
  );
}