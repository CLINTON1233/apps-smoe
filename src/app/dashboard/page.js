"use client";

import { useState, useEffect } from "react";
import { Search, Download, Filter, FileText, BarChart2, Hash } from "lucide-react"; 
import LayoutDashboard from "../components/Layout/LayoutDashboard";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes == null || bytes === 0) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // Default icon for apps without images
  const getAppIcon = (app) => {
    const colorMap = ["bg-indigo-600", "bg-cyan-600", "bg-emerald-600", "bg-rose-600"];
    const defaultColor = colorMap[app.id % colorMap.length];
    return (
      <div className={`w-14 h-14 ${defaultColor} rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg`}>
        {app.title.charAt(0).toUpperCase()}
      </div>
    );
  };

  // SweetAlert Dark Theme
  const swalDarkConfig = {
    background: "#1f2937",
    color: "#f3f4f6",
    iconColor: "#3b82f6",
    confirmButtonColor: "#3b82f6",
  };

  // Fetch applications
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/applications`);

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const result = await response.json();

      if (result.status === "success") {
        setApps(result.data);
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `Failed to load applications: ${error.message}`,
        icon: "error",
        ...swalDarkConfig,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const result = await response.json();
      if (result.status === "success") {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchCategories();
  }, []);

  // DOWNLOAD HANDLER
  const handleDownload = async (app) => {
    try {
      Swal.fire({
        title: "Downloading...",
        text: "Please wait while the file is being prepared.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        ...swalDarkConfig,
      });

      const response = await fetch(`${API_BASE_URL}/applications/${app.id}/download`);

      if (!response.ok) throw new Error(`Failed to download: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = app.file_name || `application_${app.id}.download`;
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.close();
      Swal.fire({
        title: "Download Started!",
        text: `"${a.download}" is now downloading.`,
        icon: "success",
        ...swalDarkConfig,
      });

      fetchApplications();
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Download Error",
        text: `Unable to download file: ${error.message}`,
        icon: "error",
        ...swalDarkConfig,
      });
    }
  };

  // CATEGORY LIST
  const appCategories = [
    "All",
    ...new Set(apps.map(app => app.category?.name).filter(name => name)),
  ];

  // FILTER APPS
  const filteredApps = apps.filter((app) => {
    const appCategoryName = app.category?.name || "";
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      app.title?.toLowerCase().includes(search) ||
      app.full_name?.toLowerCase().includes(search) ||
      appCategoryName.toLowerCase().includes(search);

    const matchesCategory =
      activeCategory === "All" || appCategoryName === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <LayoutDashboard>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER — Updated to English + smaller font */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Applications Dashboard
          </h1>
          <p className="text-gray-400 mt-1 text-base">
            Manage and review all your application data here.
          </p>
        </div>

        {/* SEARCH BAR */}
      <div className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
  <div className="relative">
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      size={18} // ikon juga dikecilkan sedikit
    />
    <input
      type="text"
      placeholder="Search apps by name or category..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-11 pr-4 py-2.5 bg-gray-700 text-white placeholder-gray-400 rounded-full border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
    />
  </div>
</div>


     {/* CATEGORY FILTER */}
<div className="mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700">
  <div className="flex flex-col sm:flex-row items-center gap-4">

    {/* Label */}
    <div className="flex items-center gap-2 text-gray-300 text-sm">
      <Filter size={18} className="text-blue-400" />
      <span className="font-semibold">Filter Category:</span>
    </div>

    {/* Category Buttons */}
    <div className="flex flex-wrap gap-2">
      {appCategories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            activeCategory === category
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
</div>

{/* LOADING */}
{isLoading ? (
  <div className="flex flex-col justify-center items-center py-20 bg-gray-800 rounded-xl">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
    <span className="mt-4 text-sm text-gray-300">Loading applications...</span>
  </div>
) : (
  <>
    {/* APPS GRID */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredApps.map((app) => (
        <div key={app.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          
          <div className="flex flex-col items-center mb-4">
            {getAppIcon(app)}
            <h3 className="text-base font-bold text-white mt-3 text-center">
              {app.title}
            </h3>
          </div>

          <p className="text-sm text-gray-400 text-center mb-4 h-10">
            {app.description || "No description available"}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-4 pt-2 border-t border-gray-700">
            <span className="flex items-center text-xs bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full">
              <Hash size={11} className="mr-1" /> {app.version || "N/A"}
            </span>
            <span className="flex items-center text-xs bg-emerald-900 text-emerald-300 px-3 py-1 rounded-full">
              <Download size={11} className="mr-1" /> {formatFileSize(app.file_size)}
            </span>
            <span className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-full">
              {app.category?.name || "Uncategorized"}
            </span>
          </div>

          <div className="flex justify-between text-xs border-t border-gray-700 pt-3">
            <span className="flex items-center text-gray-400">
              <BarChart2 size={12} className="mr-1" /> Downloads: {app.download_count || 0}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                app.status === "active"
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {app.status || "Active"}
            </span>
          </div>

          <button
            onClick={() => handleDownload(app)}
            disabled={!app.file_name}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl mt-4 text-xs font-semibold ${
              app.file_name
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 cursor-not-allowed text-gray-400"
            }`}
          >
            <Download size={14} />
            {app.file_name ? "Download Application" : "File Not Available"}
          </button>
        </div>
      ))}
    </div>

    {/* EMPTY STATE */}
    {filteredApps.length === 0 && (
      <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700 mt-10">
        <FileText className="w-14 h-14 mx-auto mb-4 text-gray-600" />
        <p className="text-base font-semibold text-white">No applications found</p>
        <p className="text-sm mt-2 text-gray-400 max-w-md mx-auto">
          {searchQuery || activeCategory !== "All"
            ? `No results for "${searchQuery}" in ${activeCategory}. Try different keywords.`
            : "Please add new applications in the Applications Management menu."}
        </p>
      </div>
    )}

    {/* FOOTER SUMMARY */}
    <p className="text-center text-gray-400 mt-10 text-sm">
      Displaying {filteredApps.length} of {apps.length} applications.
    </p>
  </>
)}

      </div>
    </LayoutDashboard>
  );
}
