"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  FileText,
  BarChart2,
  Hash,
} from "lucide-react";
import LayoutDashboard from "../componentsAdmin/Layout/LayoutDashboard";
import Swal from "sweetalert2";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL, { API_ENDPOINTS, getIconUrl } from "../../../config/api";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [icons, setIcons] = useState([]);
  // const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes == null || bytes === 0) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // AppIcon Component
  const AppIcon = ({ app, className = "w-14 h-14" }) => {
    const icon = app.icon || app.iconObject;

    // Jika icon adalah object lengkap
    if (icon && typeof icon === "object") {
      const iconKey = icon.icon_key;

      // Cek jika ini custom icon (file)
      if (icon.type === "custom" && icon.file_path) {
        return (
          <img
            src={getIconUrl(icon.file_path)}
            alt={icon.name}
            className={`${className} object-contain rounded-xl`}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "12px",
              backgroundColor: "#1f2937",
              padding: "4px",
            }}
            onError={(e) => {
              // Fallback ke default icon
              e.target.style.display = "none";
              const fallback = document.createElement("div");
              fallback.className = `${className} bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg`;
              fallback.innerHTML = `<span>${
                app.title?.charAt(0)?.toUpperCase() || "A"
              }</span>`;
              e.target.parentNode.appendChild(fallback);
            }}
          />
        );
      }

      // Gunakan Lucide icon jika icon_key valid
      if (iconKey) {
        const iconName = iconKey;
        const possibleNames = [
          iconName,
          iconName.charAt(0).toUpperCase() + iconName.slice(1),
          iconName
            .replace(/([A-Z])/g, " $1")
            .trim()
            .replace(/ /g, ""),
          iconName
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(""),
        ];

        for (const name of possibleNames) {
          const IconComponent = LucideIcons[name];
          if (IconComponent) {
            return (
              <div
                className={`${className} bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center p-3`}
              >
                <IconComponent className="w-8 h-8 text-white" />
              </div>
            );
          }
        }
      }
    }

    // Jika icon hanya berupa string
    if (app.icon && typeof app.icon === "string") {
      const IconComponent = LucideIcons[app.icon];
      if (IconComponent) {
        return (
          <div
            className={`${className} bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center p-3`}
          >
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        );
      }
    }

    // Fallback ke icon huruf pertama
    const colorMaps = [
      "bg-gradient-to-br from-gray-800 to-gray-900",
      "bg-gradient-to-br from-gray-700 to-gray-800",
      "bg-gradient-to-br from-gray-600 to-gray-700",
    ];
    const defaultColor = colorMaps[app.id % colorMaps.length];

    return (
      <div
        className={`${className} ${defaultColor} rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg`}
      >
        {app.title?.charAt(0)?.toUpperCase() || "A"}
      </div>
    );
  };

  // Get icon data for app
  const getAppIconData = (app) => {
    if (app.icon && typeof app.icon === "object") {
      return app.icon;
    }

    if (app.icon_id) {
      const foundIcon = icons.find((icon) => icon.id === app.icon_id);
      if (foundIcon) {
        return foundIcon;
      }
    }

    return null;
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
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to Portal...");
        window.location.href = "http://localhost:3000/login";
        return;
      }

      const response = await fetch(API_ENDPOINTS.APPLICATIONS, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const result = await response.json();

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
        ...swalDarkConfig,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.CATEGORIES, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const result = await response.json();
      if (result.status === "success") {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch icons
  const fetchIcons = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.ICONS, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === "success") {
        setIcons(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in from Portal
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "http://localhost:3000/login";
      return;
    }

    fetchApplications();
    fetchCategories();
    fetchIcons();
  }, []);

  // Handle application click with token
  const handleAppClick = (app) => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      Swal.fire({
        title: "Session Expired",
        text: "Please login again from Portal",
        icon: "warning",
        ...swalDarkConfig,
      }).then(() => {
        window.location.href = "http://localhost:3000/login";
      });
      return;
    }

    // If app has URL, open with token
    if (app.url) {
      const urlWithToken = `${app.url}${app.url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}&user=${encodeURIComponent(userData || "")}`;
      window.open(urlWithToken, "_blank");
    } else if (app.file_name) {
      // If it's a downloadable app
      handleDownload(app);
    }
  };

  // Handle download
  const handleDownload = async (app) => {
    try {
      const token = localStorage.getItem("token");
      
      Swal.fire({
        title: "Preparing Download...",
        text: "Please wait while we prepare your file",
        allowOutsideClick: false,
        background: "#1f2937",
        color: "#f9fafb",
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(API_ENDPOINTS.APPLICATION_DOWNLOAD(app.id), {
        method: "GET",
        headers: {
          "Accept": "application/octet-stream",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Download failed: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = app.file_name || `application_${app.id}.download`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.close();

      Swal.fire({
        title: "Download Started!",
        text: `"${a.download}" is being downloaded to your computer.`,
        icon: "success",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } catch (error) {
      console.error("Download error:", error);
      Swal.close();

      let errorMessage = `Failed to download file: ${error.message}`;

      if (error.message.includes("404")) {
        errorMessage = "File not found on server.";
      } else if (error.message.includes("empty")) {
        errorMessage = "Downloaded file is empty.";
      }

      Swal.fire({
        title: "Download Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    }
  };

  // Filter categories
  const appCategories = [
    "All",
    ...new Set(apps.map((app) => app.category?.name).filter((name) => name)),
  ];

  // Filter apps
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
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <LayoutDashboard>
        <div className="max-w-7xl mx-auto px-4 py-8 relative min-h-screen">
          {/* Background Logo Transparan */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                src="/seatrium_logo_white.png"
                alt="Seatrium Background Logo"
                fill
                className="object-contain opacity-3 scale-75"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* HEADER WITH LOGOUT */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Seatrium Applications Management Dashboard
                </h1>
                <p className="text-gray-400 mt-1 text-base">
                  Welcome, {user?.nama } 
                 <p className="text-gray-400 mt-1 text-base">
                Manage and review all your application data here.
              </p>
                </p>
              </div>
              
              {/* <div className="flex items-center gap-3">
                <div className="text-sm bg-blue-600 px-3 py-1 rounded-full">
                  Portal User
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm"
                >
                  Logout
                </button>
              </div> */}
            </div>

            

            {/* SEARCH BAR */}
            <div className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search SMOE apps by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-700 text-white placeholder-gray-400 rounded-full border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* CATEGORY FILTER */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Filter size={18} className="text-blue-400" />
                  <span className="font-semibold">Filter Category:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {appCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeCategory === category
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
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
                <span className="mt-4 text-sm text-gray-300">
                  Loading smoe applications...
                </span>
              </div>
            ) : (
              <>
                {/* APPS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredApps.map((app) => {
                    const appIconData = getAppIconData(app);

                    return (
                      <div
                        key={app.id}
                        className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg hover:shadow-xl hover:border-gray-600 transition-all duration-300 relative group"
                      >
                        {/* CLICKABLE AREA - MENGIRIM TOKEN KE SMOE APPS */}
                        <div
                          className="absolute inset-0 z-0 cursor-pointer"
                          onClick={() => handleAppClick(app)}
                        />

                        <div className="flex flex-col items-center mb-4 relative z-10">
                          <AppIcon app={app} className="w-14 h-14" />
                          <h3 className="text-base font-bold text-white mt-3 text-center">
                            {app.title}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-300 text-center mb-4 h-10 relative z-10">
                          {app.description || "SMOE Application"}
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 mb-4 pt-3 border-t border-gray-700 relative z-10">
                          <span className="flex items-center text-sm text-white">
                            <Hash size={13} className="mr-2 text-gray-400" />
                            Version: {app.version || "N/A"}
                          </span>
                          <span className="flex items-center text-sm text-white">
                            <Download
                              size={13}
                              className="mr-2 text-gray-400"
                            />
                            Size: {formatFileSize(app.file_size)}
                          </span>
                          <span className="text-sm text-white">
                            {app.category?.name || "SMOE"}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm border-t border-gray-700 pt-4 relative z-10">
                          <span className="flex items-center text-white">
                            <BarChart2
                              size={14}
                              className="mr-2 text-gray-400"
                            />
                            Downloads: {app.download_count || 0}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-semibold uppercase ${
                              app.status === "active"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {app.status || "Active"}
                          </span>
                        </div>

                        {/* DOWNLOAD BUTTON - DITIMPA OLEH CLICKABLE AREA */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Hindari trigger clickable area
                            handleDownload(app);
                          }}
                          disabled={!app.file_name}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl mt-4 text-sm font-semibold transition-all relative z-10 ${
                            app.file_name
                              ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25"
                              : "bg-gray-700 cursor-not-allowed text-gray-400 border border-gray-600"
                          }`}
                        >
                          <Download size={16} />
                          {app.file_name
                            ? "Download Application"
                            : "File Not Available"}
                        </button>

                        {/* INDICATOR THAT THIS IS A SMOE APP */}
                        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
                          SMOE
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* EMPTY STATE */}
                {filteredApps.length === 0 && (
                  <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700 mt-2">
                    <FileText className="w-14 h-14 mx-auto mb-4 text-gray-600" />
                    <p className="text-base font-semibold text-white">
                      No SMOE applications found
                    </p>
                    <p className="text-sm mt-2 text-gray-400 max-w-md mx-auto">
                      {searchQuery || activeCategory !== "All"
                        ? `No results for "${searchQuery}" in ${activeCategory}. Try different keywords.`
                        : "No SMOE applications available."}
                    </p>
                  </div>
                )}

                {/* FOOTER SUMMARY */}
                <p className="text-center text-gray-400 mt-10 text-sm">
                  Displaying {filteredApps.length} of {apps.length} SMOE applications.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Logout Modal
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Confirm Logout</h3>
              <p className="text-gray-300 mb-6">
                You will be redirected to the Portal login page. 
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-gray-400 text-sm border-t border-gray-700/50 relative z-10">
          <div className="max-w-6xl mx-auto px-4">
            <p>IT Applications Dashboard</p>
            <p className="mt-1">seatrium.com</p>
          </div>
        </footer>
      </LayoutDashboard>
    </ProtectedRoute>
  );
}