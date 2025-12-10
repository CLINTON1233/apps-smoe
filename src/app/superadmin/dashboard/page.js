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
import LayoutDashboard from "../componentsSuperAdmin/Layout/LayoutDashboard";
import Swal from "sweetalert2";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";

// IMPORT API CONFIGURATION
import { API_ENDPOINTS, getIconUrl } from "../../../config/api";

export default function SuperAdminDashboard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [icons, setIcons] = useState([]); // STATE UNTUK ICONS

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes == null || bytes === 0) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // ============================================================
  // AMBIL LOGIC AppIcon DARI MANAGEMENT APPSTORE
  // ============================================================

  // AppIcon Component untuk menampilkan icon
  const AppIcon = ({ app, className = "w-14 h-14" }) => {
    const icon = app.icon || app.iconObject;

    console.log("🔍 AppIcon Debug (Dashboard):", {
      appId: app.id,
      appTitle: app.title,
      iconId: app.icon_id,
      iconData: icon,
      hasIcon: !!icon,
    });

    // Jika icon adalah object lengkap (dari backend relations)
    if (icon && typeof icon === "object") {
      const iconKey = icon.icon_key;

      // Debug info
      console.log("📦 Icon object found (Dashboard):", {
        id: icon.id,
        name: icon.name,
        icon_key: iconKey,
        type: icon.type,
        file_path: icon.file_path,
      });

      // Cek jika ini custom icon (file)
      if (icon.type === "custom" && icon.file_path) {
        console.log("🖼️ Rendering custom icon (Dashboard):", icon.file_path);
        const customIconUrl = getIconUrl(icon.file_path);
        return (
          <img
            src={customIconUrl}
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
              console.error("❌ Failed to load custom icon:", customIconUrl);
              // Fallback ke default icon
              e.target.style.display = "none";
              // Show fallback
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
        // Cari nama icon yang tepat di LucideIcons
        const iconName = iconKey;
        console.log("🔤 Looking for Lucide icon (Dashboard):", iconName);

        // Coba beberapa format
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
            console.log("✅ Found Lucide icon (Dashboard):", name);
            return (
              <div
                className={`${className} bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center p-3`}
              >
                <IconComponent className="w-8 h-8 text-white" />
              </div>
            );
          }
        }

        console.log(
          "❌ No Lucide icon found for any variation of (Dashboard):",
          iconName
        );
      }
    }

    // Jika ada icon_id tapi tidak ada icon object, cari di icons list
    if (app.icon_id && !icon) {
      console.log(
        "🔍 Icon ID exists but no object, searching in icons list (Dashboard)..."
      );
      const foundIcon = icons.find((i) => i.id === app.icon_id);
      if (foundIcon) {
        console.log("✅ Found icon in icons list (Dashboard):", foundIcon.name);
        // Rekursif panggil diri sendiri dengan icon yang ditemukan
        return (
          <AppIcon app={{ ...app, icon: foundIcon }} className={className} />
        );
      }
    }

    // Jika icon hanya berupa string (icon_key langsung dari backend lama)
    if (app.icon && typeof app.icon === "string") {
      console.log("📝 Icon is string (Dashboard):", app.icon);
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

    // Fallback ke icon default berdasarkan category
    console.log("🔄 Falling back to default icon (Dashboard)");

    // Coba icon berdasarkan category
    if (app.category?.name) {
      const category = app.category.name.toLowerCase();
      const categoryIcons = {
        design: "Palette",
        development: "Code",
        productivity: "CheckSquare",
        communication: "MessageSquare",
        finance: "DollarSign",
        graphics: "Image",
        media: "Video",
        education: "BookOpen",
        utility: "Settings",
        game: "Gamepad",
        business: "Briefcase",
        health: "Heart",
        software: "Cpu",
        web: "Globe",
        mobile: "Smartphone",
        desktop: "Monitor",
        security: "Shield",
        database: "Database",
        cloud: "Cloud",
        network: "Wifi",
      };

      for (const [cat, iconName] of Object.entries(categoryIcons)) {
        if (category.includes(cat)) {
          const IconComponent = LucideIcons[iconName];
          if (IconComponent) {
            console.log(
              `🎯 Using category icon for ${category} (Dashboard): ${iconName}`
            );
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

    // Ultimate fallback - icon huruf pertama dengan background gradient
    console.log(
      "⚠️ Ultimate fallback - showing default letter icon (Dashboard)"
    );
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

  // Get icon data for app (helper function)
  const getAppIconData = (app) => {
    // Pertama, coba gunakan icon dari relation (jika ada)
    if (app.icon && typeof app.icon === "object") {
      return app.icon;
    }

    // Jika tidak ada relation, cari di icons list
    if (app.icon_id) {
      const foundIcon = icons.find((icon) => icon.id === app.icon_id);
      if (foundIcon) {
        return foundIcon;
      }
    }

    return null;
  };

  // ============================================================
  // END OF ICON LOGIC
  // ============================================================

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
      console.log("=== FETCHING APPLICATIONS (Dashboard) ===");
      const response = await fetch(API_ENDPOINTS.APPLICATIONS);

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const result = await response.json();

      // Debug: Periksa data aplikasi
      if (result.data && Array.isArray(result.data)) {
        console.log(`Total applications: ${result.data.length}`);
        result.data.forEach((app, index) => {
          console.log(`\nApp ${index + 1} (Dashboard):`, {
            id: app.id,
            title: app.title,
            icon_id: app.icon_id,
            hasIcon: !!app.icon,
            iconData: app.icon,
            iconKey: app.icon?.icon_key,
            iconType: app.icon?.type,
          });
        });
      }

      if (result.status === "success") {
        setApps(result.data);
        console.log("Applications updated in state (Dashboard)");
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error fetching applications (Dashboard):", error);
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
      const response = await fetch(API_ENDPOINTS.CATEGORIES);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const result = await response.json();
      if (result.status === "success") {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch icons (untuk backup jika icon tidak ada di relation)
  const fetchIcons = async () => {
    try {
      console.log("Fetching icons from (Dashboard):", API_ENDPOINTS.ICONS);
      const response = await fetch(API_ENDPOINTS.ICONS);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("=== ICONS DATA (Dashboard) ===", result);

      if (result.status === "success") {
        setIcons(result.data || []);
        console.log(
          "Total icons loaded (Dashboard):",
          result.data?.length || 0
        );

        // Debug: Periksa beberapa icon
        if (result.data && Array.isArray(result.data)) {
          result.data.slice(0, 3).forEach((icon, index) => {
            console.log(`Icon ${index} (Dashboard):`, {
              id: icon.id,
              name: icon.name,
              icon_key: icon.icon_key,
              type: icon.type,
            });
          });
        }
      }
    } catch (error) {
      console.error("Error fetching icons (Dashboard):", error);
      // Tidak perlu show error untuk icons di dashboard
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchCategories();
    fetchIcons(); // Fetch icons untuk backup
  }, []);

  // ============================================================
  // DOWNLOAD HANDLER - DIAMBIL DARI MANAGEMENT APPSTORE
  // ============================================================
  const handleDownload = async (app) => {
    try {
      // Show loading
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

      console.log("Starting download for app:", app);

      const response = await fetch(API_ENDPOINTS.APPLICATION_DOWNLOAD(app.id), {
        method: "GET",
        headers: {
          Accept: "application/octet-stream",
        },
      });

      console.log("Download response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Download failed: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log("Blob received, size:", blob.size);

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      const fileName = app.file_name || `application_${app.id}.download`;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.close();

      Swal.fire({
        title: "Download Started!",
        text: `"${fileName}" is being downloaded to your computer.`,
        icon: "success",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });

      // Refresh data setelah download
      setTimeout(() => {
        fetchApplications();
      }, 1000);
    } catch (error) {
      console.error("Download error:", error);
      Swal.close();

      let errorMessage = `Failed to download file: ${error.message}`;

      if (error.message.includes("404")) {
        errorMessage =
          "File not found on server. Please contact administrator.";
      } else if (error.message.includes("empty")) {
        errorMessage = "Downloaded file is empty. The file might be corrupted.";
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

  // CATEGORY LIST
  const appCategories = [
    "All",
    ...new Set(apps.map((app) => app.category?.name).filter((name) => name)),
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
            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">
                Seatrium Applications Dashboard
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
                  size={18}
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
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                  Loading applications...
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
                        className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg hover:shadow-xl hover:border-gray-600 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center mb-4">
                          {/* GUNAKAN AppIcon COMPONENT */}
                          <AppIcon app={app} className="w-14 h-14" />

                          <h3 className="text-base font-bold text-white mt-3 text-center">
                            {app.title}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-300 text-center mb-4 h-10">
                          {app.description || "No description available"}
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 mb-4 pt-3 border-t border-gray-700">
                          {/* VERSION BADGE - NO BACKGROUND */}
                          <span className="flex items-center text-sm text-white">
                            <Hash size={13} className="mr-2 text-gray-400" />
                            Version: {app.version || "N/A"}
                          </span>

                          {/* FILE SIZE BADGE - NO BACKGROUND */}
                          <span className="flex items-center text-sm text-white">
                            <Download
                              size={13}
                              className="mr-2 text-gray-400"
                            />
                            Size: {formatFileSize(app.file_size)}
                          </span>

                          {/* CATEGORY BADGE - NO BACKGROUND */}
                          <span className="text-sm text-white">
                            {app.category?.name || "Uncategorized"}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm border-t border-gray-700 pt-4">
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
                                // : "text-red-400"
                                :"text-green-400"
                            }`}
                          >
                            {app.status || "Active"}
                          </span>
                        </div>

                        {/* DOWNLOAD BUTTON - MENGGUNAKAN FUNGSI YANG BARU */}
                        <button
                          onClick={() => handleDownload(app)}
                          disabled={!app.file_name}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl mt-4 text-sm font-semibold transition-all ${
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
                      </div>
                    );
                  })}
                </div>

                {/* EMPTY STATE */}
                {filteredApps.length === 0 && (
                  <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700 mt-2">
                    <FileText className="w-14 h-14 mx-auto mb-4 text-gray-600" />
                    <p className="text-base font-semibold text-white">
                      No applications found
                    </p>
                    <p className="text-sm mt-2 text-gray-400 max-w-md mx-auto">
                      {searchQuery || activeCategory !== "All"
                        ? `No results for "${searchQuery}" in ${activeCategory}. Try different keywords.`
                        : "Please add new applications in the Applications Management menu."}
                    </p>
                  </div>
                )}

                {/* FOOTER SUMMARY */}
                <p className="text-center text-gray-400 mt-10 text-sm">
                  Displaying {filteredApps.length} of {apps.length}{" "}
                  applications.
                </p>
              </>
            )}
          </div>
        </div>
        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-gray-400 text-sm border-t border-gray-700/50 relative z-10">
          <div className="max-w-6xl mx-auto px-4">
            <p>IT Application Dashboard</p>
            <p className="mt-1">
              <a
                href="https://seatrium.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray hover:text-gray-300"
              >
                seatrium.com
              </a>
            </p>
          </div>
        </footer>
      </LayoutDashboard>
    </ProtectedRoute>
  );
}
