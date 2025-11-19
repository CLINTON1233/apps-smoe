"use client";

import { useState, useEffect } from "react";
import { Search, Download, Filter, FileText } from "lucide-react";
import LayoutDashboard from "../components/Layout/LayoutDashboard";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch applications from API
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/applications`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);
      if (result.status === "success") {
        setApps(result.data);
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to load applications: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#1e40af",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Categories Response:", result);

      if (result.status === "success") {
        setCategories(result.data);
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchApplications();
    fetchCategories();
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // Handle download
  const handleDownload = async (app) => {
    try {
      // Show loading
      Swal.fire({
        title: "Downloading...",
        text: "Please wait while we prepare your download",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        `${API_BASE_URL}/applications/${app.id}/download`
      );

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status} ${response.statusText}`
        );
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      // Use the original file name from the application data
      const fileName = app.file_name || `application_${app.id}.download`;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close loading and show success
      Swal.close();

      Swal.fire({
        title: "Download Started!",
        text: `"${fileName}" is being downloaded to your computer.`,
        icon: "success",
        confirmButtonColor: "#1e40af",
      });

      // Refresh applications to update download count
      fetchApplications();
    } catch (error) {
      console.error("Download error:", error);
      Swal.close();
      Swal.fire({
        title: "Download Error",
        text: `Failed to download file: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#1e40af",
      });
    }
  };

  // Get unique categories from apps
  const appCategories = ["All", ...new Set(apps.map(app => app.category?.name).filter(Boolean))];

  // Filter apps based on search and category
  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      activeCategory === "All" || app.category?.name === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Default icon for apps without images
  const getAppIcon = (app) => {
    // You can replace this with actual icon logic from your database
    return (
      <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
        {app.title.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <LayoutDashboard>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your Administration panel</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter size={16} className="text-blue-600" />
              <span className="font-semibold">Categories:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {appCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-blue-700 text-white border-blue-700 shadow-md"
                      : "bg-white text-gray-900 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading applications...</span>
          </div>
        ) : (
          <>
            {/* Apps Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex justify-center mb-3">
                    {getAppIcon(app)}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 text-center">
                    {app.title}
                  </h3>
                  <div className="flex gap-2 justify-center mt-2">
                    <span className="text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded">
                      {app.version || "1.0.0"}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded">
                      {formatFileSize(app.file_size)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-3 text-center line-clamp-2">
                    {app.description || "No description available"}
                  </p>
                  <span className="mt-3 mx-auto bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                    {app.category?.name || "Uncategorized"}
                  </span>
                  <div className="flex justify-between items-center mt-4 text-xs">
                    <span className="text-gray-700">Downloads: {app.download_count || 0}</span>
                    <span className={`px-2 py-1 rounded-full text-gray-900 ${
                      app.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {app.status || "active"}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDownload(app)}
                    disabled={!app.file_name}
                    className={`px-4 py-2 text-white rounded-lg mt-4 transition ${
                      app.file_name 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {app.file_name ? "Download" : "No File"}
                  </button>
                </div>
              ))}
            </div>

            {/* No Data State */}
            {filteredApps.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-600">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg text-gray-900">No applications found</p>
                <p className="text-sm mt-1 text-gray-700">
                  {searchQuery || activeCategory !== "All"
                    ? "Try adjusting your search terms or category filter"
                    : "Get started by adding a new application in the Applications Management"}
                </p>
              </div>
            )}

            <p className="text-center text-gray-700 mt-6">
              Showing {filteredApps.length} of {apps.length} applications
            </p>
          </>
        )}
      </div>
    </LayoutDashboard>
  );
}