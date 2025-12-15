"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  RefreshCw,
  ChevronDown,
  FileText,
  Upload,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import LayoutDashboard from "../componentsSuperAdmin/Layout/LayoutDashboard";
import Swal from "sweetalert2";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";
// import API_BASE_URL, { API_ENDPOINTS, getIconUrl } from "../../../config/api";
import API_BASE_URL, { 
  API_ENDPOINTS, 
  getIconUrl, 
  SMOE_API_URL 
} from "../../../config/api";

// Dynamic icon component
const DynamicIcon = ({ iconName, ...props }) => {
  const IconComponent = LucideIcons[iconName];

  if (!IconComponent) {
    return <LucideIcons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};

export default function AdminApplicationsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [icons, setIcons] = useState([]);
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);

  // New states for IconDropdown
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [showEditIconDropdown, setShowEditIconDropdown] = useState(false);
  const [editIconSearch, setEditIconSearch] = useState("");

  // Form states

  const [newApp, setNewApp] = useState({
    title: "",
    fullName: "",
    categoryId: "",
    version: "1.0.0",
    description: "",
    file: null,
    iconId: "",
    status: "license", // TAMBAH INI
  });

  const [editApp, setEditApp] = useState({
    id: null,
    title: "",
    fullName: "",
    categoryId: "",
    version: "1.0.0",
    description: "",
    file: null,
    iconId: "",
    status: "license", // TAMBAH INI
  });
  const entriesOptions = [10, 25, 50, 100, "All"];

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // AppIcon Component untuk menampilkan icon di table
const AppIcon = ({ app, className = "w-6 h-6" }) => {
  const icon = app.icon || app.iconObject;

  // Jika icon adalah object lengkap (dari backend relations)
  if (icon && typeof icon === "object") {
    const iconKey = icon.icon_key;

    // Cek jika ini custom icon (file)
    if (icon.type === "custom" && icon.file_path) {
      const iconUrl = getIconUrl(icon.file_path);
      
      return (
        <div 
          className={`${className} flex items-center justify-center overflow-hidden`}
          style={{
            width: "100%",
            height: "100%",
            minWidth: "24px",
            minHeight: "24px",
            maxWidth: "24px",
            maxHeight: "24px",
          }}
        >
          <img
            src={iconUrl}
            alt={icon.name}
            className="max-w-full max-h-full object-contain"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "4px",
            }}
            onError={(e) => {
              // Gunakan console.warn daripada console.error untuk menghindari error di console
              console.warn("Custom icon failed to load, using fallback:", {
                url: iconUrl,
                file_path: icon.file_path,
              });
              
              // Hide the image
              e.target.style.display = 'none';
              
              // Show fallback
              const fallbackDiv = e.target.parentNode.querySelector('.icon-fallback');
              if (fallbackDiv) {
                fallbackDiv.style.display = 'flex';
              }
            }}
        onLoad={(loadEvent) => {
  console.log("✅ Custom icon loaded successfully:", iconUrl);
  // Hide fallback if it exists
  const fallbackDiv = loadEvent.target.parentNode.querySelector('.icon-fallback');
  if (fallbackDiv) {
    fallbackDiv.style.display = 'none';
  }
}}
          />
          {/* Fallback div */}
          <div 
            className="icon-fallback hidden w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg items-center justify-center"
            style={{
              minWidth: "24px",
              minHeight: "24px",
              maxWidth: "24px",
              maxHeight: "24px",
            }}
          >
            <span className="text-white text-xs font-bold">
              {app.title?.charAt(0)?.toUpperCase() || "A"}
            </span>
          </div>
        </div>
      );
    }

    // Gunakan Lucide icon jika icon_key valid
    if (iconKey) {
      // Cari nama icon yang tepat di LucideIcons
      const iconName = iconKey;
      console.log("🔤 Looking for Lucide icon:", iconName);

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
          console.log("✅ Found Lucide icon:", name);
          return (
            <div className={className}>
              <IconComponent className="w-full h-full" />
            </div>
          );
        }
      }

      console.log("❌ No Lucide icon found for any variation of:", iconName);
    }
  }

  // Jika ada icon_id tapi tidak ada icon object, cari di icons list
  if (app.icon_id && !icon) {
    console.log(
      "🔍 Icon ID exists but no object, searching in icons list..."
    );
    const foundIcon = icons.find((i) => i.id === app.icon_id);
    if (foundIcon) {
      console.log("✅ Found icon in icons list:", foundIcon.name);
      // Rekursif panggil diri sendiri dengan icon yang ditemukan
      return (
        <AppIcon app={{ ...app, icon: foundIcon }} className={className} />
      );
    }
  }

  // Jika icon hanya berupa string (icon_key langsung dari backend lama)
  if (app.icon && typeof app.icon === "string") {
    console.log("📝 Icon is string:", app.icon);
    const IconComponent = LucideIcons[app.icon];
    if (IconComponent) {
      return (
        <div className={className}>
          <IconComponent className="w-full h-full" />
        </div>
      );
    }
  }

  // Fallback ke icon default berdasarkan category
  console.log("🔄 Falling back to default icon");

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
    };

    for (const [cat, iconName] of Object.entries(categoryIcons)) {
      if (category.includes(cat)) {
        const IconComponent = LucideIcons[iconName];
        if (IconComponent) {
          console.log(`🎯 Using category icon for ${category}: ${iconName}`);
          return (
            <div className={className}>
              <IconComponent className="w-full h-full" />
            </div>
          );
        }
      }
    }
  }

  // Ultimate fallback - icon A dengan background
  console.log("⚠️ Ultimate fallback - showing default 'A' icon");
  return (
    <div
      className={`${className} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center`}
      style={{
        minWidth: "24px",
        minHeight: "24px",
        maxWidth: "24px",
        maxHeight: "24px",
      }}
    >
      <span className="text-white text-xs font-bold">
        {app.title?.charAt(0)?.toUpperCase() || "A"}
      </span>
    </div>
  );
};

  // IconDropdown Component
  const IconDropdown = ({
    selectedIcon,
    onSelectIcon,
    isOpen,
    onToggle,
    searchQuery,
    onSearchChange,
    isEdit = false,
    currentIconId = null,
  }) => {
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    const filteredIcons = icons.filter(
      (icon) =>
        icon.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.icon_key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
      console.log("IconDropdown - Icons loaded:", icons.length);
      console.log("Current selectedIcon:", selectedIcon);
      console.log("Current iconId from props:", currentIconId);

      // Jika ada currentIconId tapi tidak ada selectedIcon, coba set
      if (currentIconId && !selectedIcon) {
        const foundIcon = icons.find(
          (icon) => icon.id === parseInt(currentIconId)
        );
        if (foundIcon) {
          console.log("Found icon for currentIconId:", foundIcon);
        }
      }
    }, [icons, selectedIcon, currentIconId]);

const IconComponent = ({ iconKey, className = "w-4 h-4" }) => {
  console.log("IconComponent called with key:", iconKey);

  // Cek jika iconKey adalah string
  if (iconKey && typeof iconKey === "string") {
    // Cek jika ini custom icon (file)
    if (iconKey.includes("icon-") && iconKey.includes(".")) {
      // Pastikan iconKey sudah dalam format yang benar
      let iconFileName = iconKey;
      
      // Jika iconKey sudah mengandung path, ambil hanya nama filenya
      if (iconKey.includes("/")) {
        iconFileName = iconKey.split("/").pop();
      }
      
      // Tambahkan path jika belum ada
      const iconPath = iconFileName.startsWith("icon-") ? 
        `uploads/icons/${iconFileName}` : 
        `uploads/icons/icon-${iconFileName}`;
      
      const fullUrl = getIconUrl(iconPath);

      console.log("Loading custom icon from:", fullUrl);

      return (
        <div 
          className={`${className} flex items-center justify-center overflow-hidden`}
          style={{
            minWidth: "16px",
            minHeight: "16px",
            maxWidth: "16px",
            maxHeight: "16px",
          }}
        >
          <img
            src={fullUrl}
            alt="Custom Icon"
            className="max-w-full max-h-full object-contain"
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "contain" 
            }}
            onError={(e) => {
              // Gunakan console.warn untuk tidak mengganggu dengan error
              console.warn(
                "Custom icon failed to load, using fallback:",
                iconFileName
              );
              
              // Fallback ke Lucide icon dengan cara yang lebih bersih
              e.target.style.display = 'none';
              
              // Buat fallback element
              const fallbackDiv = document.createElement('div');
              fallbackDiv.className = 'flex items-center justify-center w-full h-full bg-gray-700 rounded';
              fallbackDiv.innerHTML = '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
              
              e.target.parentNode.appendChild(fallbackDiv);
            }}
            onLoad={() => {
              console.log("Custom icon loaded successfully:", iconFileName);
            }}
          />
        </div>
      );
    }

    // Coba berbagai format nama icon untuk Lucide
    const possibleKeys = [
      iconKey,
      iconKey.charAt(0).toUpperCase() + iconKey.slice(1),
      iconKey.replace(/-/g, ""),
      iconKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(""),
    ];

    for (const key of possibleKeys) {
      const LucideIcon = LucideIcons[key];
      if (LucideIcon) {
        console.log("Found Lucide icon for key:", key);
        return <LucideIcon className={className} />;
      }
    }

    console.log("No Lucide icon found for any variation of:", iconKey);
  }

  // Fallback ke icon default
  return <LucideIcons.Image className={className} />;
};
    // Fungsi untuk handle upload custom icon
    const handleFileUpload = (event, mode) => {
      const file = event.target.files[0];
      if (file) {
        handleUploadCustomIcon(file, mode);
        // Reset file input
        event.target.value = "";
      }
    };

    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          onToggle();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [isOpen, onToggle]);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="w-full px-3 py-2 text-sm border border-gray-600 rounded flex items-center justify-between bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          <div className="flex items-center gap-2">
            {selectedIcon ? (
              <>
                <div className="p-1 bg-blue-900/50 rounded">
                  <IconComponent
                    iconKey={selectedIcon.icon_key}
                    className="w-4 h-4 text-blue-400"
                  />
                </div>
                <span>{selectedIcon.name}</span>
              </>
            ) : currentIconId ? (
              <>
                <div className="p-1 bg-blue-900/50 rounded">
                  {(() => {
                    const icon = icons.find(
                      (icon) => icon.id === parseInt(currentIconId)
                    );
                    if (icon) {
                      return (
                        <IconComponent
                          iconKey={icon.icon_key}
                          className="w-4 h-4 text-blue-400"
                        />
                      );
                    }
                    return <span className="text-gray-400">Loading...</span>;
                  })()}
                </div>
                <span className="text-gray-400">Icon selected</span>
              </>
            ) : (
              <span className="text-gray-400">Select an icon</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Upload Option - DIATAS SEARCH BAR */}
            <div className="p-2 border-b border-gray-700">
              <label className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span>Upload Custom Icon</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, isEdit ? "edit" : "add")}
                />
              </label>
              <p className="text-xs text-gray-400 text-center mt-1">
                Max 5MB • JPEG, PNG, SVG, WebP
              </p>
            </div>

            {/* Search Input */}
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search icons..."
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-600 rounded text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Icons List */}
            <div className="overflow-y-auto max-h-48">
              {filteredIcons.length > 0 ? (
                <div className="p-1 space-y-1">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => {
                        onSelectIcon(icon);
                        onSearchChange("");
                        onToggle();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded hover:bg-blue-900/50 hover:text-white transition ${
                        selectedIcon?.id === icon.id
                          ? "bg-blue-900 text-white"
                          : "text-gray-300"
                      }`}
                    >
                      <div className="p-1 bg-gray-700 rounded">
                        <IconComponent
                          iconKey={icon.icon_key}
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{icon.name}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {icon.category} • {icon.type}
                        </div>
                      </div>
                      {selectedIcon?.id === icon.id && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No icons found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
// Di handleUploadCustomIcon function, perbaiki:
const handleUploadCustomIcon = async (file, mode = "add") => {
  try {
    setIsUploading(true);

    // Validasi file
    if (!file) {
      Swal.fire({
        title: "Error",
        text: "Please select a file",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: "Error",
        text: "Only image files are allowed (JPEG, PNG, SVG, WebP)",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        title: "Error",
        text: "File size must be less than 5MB",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name.replace(/\.[^/.]+$/, ""));
    formData.append("category", "Custom");

    console.log("📤 Uploading custom icon...", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // **PERBAIKAN: Gunakan langsung API_ENDPOINTS.ICONS + '/upload'**
    const uploadEndpoint = `${API_ENDPOINTS.ICONS}/upload`;
    console.log("🌐 Upload endpoint:", uploadEndpoint);

    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
      // Jangan set Content-Type header, biarkan browser handle FormData
    });

    console.log("📥 Upload response status:", response.status);

    if (!response.ok) {
      let errorMessage = `Upload failed: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Jika bukan JSON
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Upload result:", result);

    if (result.status === "success") {
      const newIcon = result.data;
      console.log("🆕 New icon created:", newIcon);
      
      // Tambahkan icon baru ke list
      setIcons(prev => [...prev, newIcon]);
      
      // Pilih icon yang baru diupload
      if (mode === "add") {
        setNewApp(prev => ({
          ...prev,
          iconId: newIcon.id.toString(),
        }));
        setShowIconDropdown(false);
      } else {
        setEditApp(prev => ({
          ...prev,
          iconId: newIcon.id.toString(),
        }));
        setShowEditIconDropdown(false);
      }

      // Refresh icons list
      await fetchIcons();

      Swal.fire({
        title: "Success!",
        text: "Custom icon uploaded successfully",
        icon: "success",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
        timer: 2000,
      });
    } else {
      throw new Error(result.message || "Upload failed");
    }
  } catch (error) {
    console.error("❌ Error uploading custom icon:", error);
    
    let errorMessage = error.message;
    
    // Petunjuk troubleshooting
    if (error.message.includes("404") || error.message.includes("Not Found")) {
      errorMessage = `Cannot upload icon. Please check:
      1. Backend server is running on port 5000
      2. Endpoint /icons/upload exists
      3. Try accessing http://localhost:5000/icons directly in browser`;
    }
    
    Swal.fire({
      title: "Upload Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#3b82f6",
      background: "#1f2937",
      color: "#f9fafb",
    });
  } finally {
    setIsUploading(false);
  }
};
  // Fetch applications
  // PERBAIKAN: Enhanced fetchApplications untuk debugging
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      console.log("=== FETCHING APPLICATIONS ===");
      const response = await fetch(API_ENDPOINTS.APPLICATIONS);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("=== APPLICATIONS API RESPONSE ===", result);

      // Debug: Periksa icon data untuk setiap aplikasi
      if (result.data && Array.isArray(result.data)) {
        console.log(`Total applications: ${result.data.length}`);
        result.data.forEach((app, index) => {
          console.log(`\nApp ${index + 1}:`, {
            id: app.id,
            title: app.title,
            icon_id: app.icon_id,
            hasIcon: !!app.icon,
            iconData: app.icon,
            iconType: app.icon?.type,
            iconKey: app.icon?.icon_key,
            iconName: app.icon?.name,
          });

          // Jika ada icon_id tapi icon data tidak ada
          if (app.icon_id && !app.icon) {
            console.warn(
              `⚠️ App ${app.id} has icon_id ${app.icon_id} but no icon data!`
            );
          }
        });
      }

      if (result.status === "success") {
        setApps(result.data);
        console.log("Applications updated in state");
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to load applications: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch icons
  const fetchIcons = async () => {
    setIsLoadingIcons(true);
    try {
      console.log("Fetching icons from:", API_ENDPOINTS.ICONS);
      const response = await fetch(API_ENDPOINTS.ICONS);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("=== ICONS DATA ===", result);

      if (result.status === "success") {
        setIcons(result.data || []);
        console.log("Total icons loaded:", result.data?.length || 0);

        // Debug: Periksa beberapa icon
        if (result.data && Array.isArray(result.data)) {
          result.data.slice(0, 5).forEach((icon, index) => {
            console.log(`Icon ${index}:`, {
              id: icon.id,
              name: icon.name,
              icon_key: icon.icon_key,
              type: icon.type,
              file_path: icon.file_path,
            });
          });
        }
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to load icons: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setIsLoadingIcons(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log("Fetching categories from:", API_ENDPOINTS.CATEGORIES);

      const response = await fetch(API_ENDPOINTS.CATEGORIES);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Categories Response:", result);

      if (result.status === "success") {
        setCategories(result.data || []);
        console.log("Categories loaded:", result.data);
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to load categories: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    }
  };

  // Get icon data for app
  const getAppIcon = (app) => {
    console.log(`🔍 getAppIcon for app ${app.id}:`, {
      icon_id: app.icon_id,
      icon_in_app: app.icon,
      has_relation: !!app.icon,
    });

    // Pertama, coba gunakan icon dari relation (jika ada)
    if (app.icon && typeof app.icon === "object") {
      console.log("✅ Using icon from app relation");
      return app.icon;
    }

    // Jika tidak ada relation, cari di icons list
    if (app.icon_id) {
      console.log(`🔍 Searching icon ${app.icon_id} in icons list`);
      const foundIcon = icons.find((icon) => {
        const match = icon.id === app.icon_id;
        if (match) {
          console.log("✅ Found icon in icons list:", icon.name);
        }
        return match;
      });

      if (foundIcon) {
        return foundIcon;
      } else {
        console.warn(`⚠️ Icon ID ${app.icon_id} not found in icons list`);
      }
    }

    console.log("❌ No icon found for app");
    return null;
  };
  // Initial data fetch
  useEffect(() => {
    fetchApplications();
    fetchCategories();
    fetchIcons();
  }, []);

  // Filter data
  const filteredApps = apps.filter(
    (app) =>
      app.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const currentData = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (value) => {
    if (value === "All") {
      setItemsPerPage(filteredApps.length);
    } else {
      setItemsPerPage(value);
    }
    setCurrentPage(1);
    setShowEntriesDropdown(false);
  };

  const ShowEntriesDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowEntriesDropdown(!showEntriesDropdown)}
        className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-600 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
      >
        Show {itemsPerPage === filteredApps.length ? "All" : itemsPerPage}
        <ChevronDown className="w-3 h-3" />
      </button>

      {showEntriesDropdown && (
        <div className="absolute bottom-full mb-1 left-0 w-20 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
          {entriesOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleItemsPerPageChange(option)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-600 hover:text-white transition ${
                itemsPerPage ===
                (option === "All" ? filteredApps.length : option)
                  ? "bg-blue-600 text-white"
                  : "text-gray-200"
              }`}
            >
              {option === "All" ? "All" : option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Handle Create Application
  const handleCreateApp = async () => {
    if (isSubmitting || isUploading) return;

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (!newApp.title || !newApp.fullName || !newApp.categoryId) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields",
          icon: "warning",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
        return;
      }

      console.log("Creating app with iconId:", newApp.iconId);
      console.log(
        "Selected icon:",
        icons.find((icon) => icon.id === parseInt(newApp.iconId))
      );

      const formData = new FormData();
      formData.append("title", newApp.title);
      formData.append("fullName", newApp.fullName);
      formData.append("categoryId", newApp.categoryId);
      formData.append("status", newApp.status);
      formData.append("version", newApp.version);
      formData.append("description", newApp.description);

      // PERBAIKAN: Handle iconId dengan benar
      if (newApp.iconId && newApp.iconId !== "" && newApp.iconId !== "null") {
        formData.append("iconId", newApp.iconId);
        console.log("Icon ID appended to formData:", newApp.iconId);
      } else {
        formData.append("iconId", ""); // Empty string jika tidak ada icon
        console.log("No icon selected, sending empty string");
      }

      if (newApp.file) {
        formData.append("file", newApp.file);
      }

      // Log formData untuk debugging
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Gunakan fetch dengan FormData
      const response = await fetch(API_ENDPOINTS.APPLICATIONS, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        let errorMessage = "Upload failed";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Create result:", result);

      if (result.status === "success") {
        setShowAddModal(false);
        setNewApp({
          title: "",
          fullName: "",
          categoryId: "",
          version: "1.0.0",
          description: "",
          file: null,
          iconId: "",
        });
        setUploadProgress(0);

        // PERBAIKAN: Refresh data setelah create
        await Promise.all([fetchApplications(), fetchIcons()]);

        Swal.fire({
          title: "Success!",
          text: "Application created successfully",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error creating application:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to create application: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // PERBAIKAN: Update handleUpdateApp function
  const handleUpdateApp = async () => {
    if (isSubmitting || isUploading) return;

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (!editApp.title || !editApp.fullName || !editApp.categoryId) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields",
          icon: "warning",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
        return;
      }

      console.log("Updating app with iconId:", editApp.iconId);
      console.log(
        "Selected icon:",
        icons.find((icon) => icon.id === parseInt(editApp.iconId))
      );

      const formData = new FormData();
      formData.append("title", editApp.title);
      formData.append("fullName", editApp.fullName);
      formData.append("categoryId", editApp.categoryId);
      formData.append("status", newApp.status);
      formData.append("version", editApp.version);
      formData.append("description", editApp.description);

      // PERBAIKAN: Handle iconId dengan benar
      if (
        editApp.iconId &&
        editApp.iconId !== "" &&
        editApp.iconId !== "null"
      ) {
        formData.append("iconId", editApp.iconId);
        console.log("Icon ID appended to formData:", editApp.iconId);
      } else {
        formData.append("iconId", ""); // Empty string untuk menghapus icon
        console.log("No icon selected, sending empty string to remove icon");
      }

      if (editApp.file) {
        formData.append("file", editApp.file);
      }

      // Log formData untuk debugging
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Gunakan fetch dengan FormData
      const response = await fetch(
        API_ENDPOINTS.APPLICATION_BY_ID(editApp.id),
        {
          method: "PUT",
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        let errorMessage = "Upload failed";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Update result:", result);

      if (result.status === "success") {
        setShowEditModal(false);
        setUploadProgress(0);

        // PERBAIKAN: Refresh data setelah update
        await Promise.all([fetchApplications(), fetchIcons()]);

        Swal.fire({
          title: "Success!",
          text: "Application updated successfully",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error updating application:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to update application: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  // Handle Delete Application
  const handleDeleteApp = async (app) => {
    const result = await Swal.fire({
      title: `Delete ${app.title}?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#1f2937",
      color: "#f9fafb",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(API_ENDPOINTS.APPLICATION_BY_ID(app.id), {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.status === "success") {
          fetchApplications();
          Swal.fire({
            title: "Deleted!",
            text: `${app.title} has been deleted.`,
            icon: "success",
            confirmButtonColor: "#3b82f6",
            background: "#1f2937",
            color: "#f9fafb",
          });
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete application.",
          icon: "error",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
      }
    }
  };

  // Handle File Download
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

  // Mobile Card View
  const MobileAppCard = ({ app }) => {
    const appIcon = getAppIcon(app);

    return (
      <div className="bg-gray-800 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/50 rounded-lg">
              {appIcon ? (
                <AppIcon app={app} className="w-6 h-6 text-blue-400" />
              ) : (
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{app.title}</h3>
              <p className="text-xs text-gray-400">ID: {app.id}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setSelectedApp(app);
                setShowDetailModal(true);
              }}
              className="p-1 text-gray-400 hover:text-blue-400 rounded transition-all"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setEditApp({
                  id: app.id,
                  title: app.title,
                  fullName: app.full_name,
                  categoryId: app.category_id,
                  iconId: app.icon_id,
                  version: app.version || "1.0.0",
                  description: app.description || "",
                  file: null,
                });
                setShowEditModal(true);
              }}
              className="p-1 text-gray-400 hover:text-green-400 rounded transition-all"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteApp(app)}
              className="p-1 text-gray-400 hover:text-red-400 rounded transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Full Name:</span>
            <span className="text-white font-medium">{app.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Category:</span>
            <span className="text-white font-medium">{app.category?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Version:</span>
            <span className="text-white font-medium">
              {app.version || "1.0.0"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400"> Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                app.status === "license"
                  ? "bg-blue-900/50 text-blue-400"
                  : "bg-green-900/50 text-green-400"
              }`}
            >
              {app.status === "license" ? "License" : "Paid"}
            </span>
          </div>
          {app.file_name && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">File:</span>
                <span className="text-white font-medium">{app.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">File Size:</span>
                <span className="text-white font-medium">
                  {formatFileSize(app.file_size)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Download:</span>
                <button
                  onClick={() => handleDownload(app)}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Download
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Detail Modal Component
  const AppDetailModal = ({ app, onClose }) => {
    const appIcon = getAppIcon(app);

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
        <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl animate-fade-in relative mx-auto">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-white mb-4">
            Application Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {appIcon ? (
                <div className="p-2 bg-blue-900/50 rounded-lg">
                  <AppIcon app={app} className="w-6 h-6 text-blue-400" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <p className="text-white">{app.title}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <p className="text-white">{app.full_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <p className="text-white">{app.category?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Version
              </label>
              <p className="text-white">{app.version || "1.0.0"}</p>
            </div>

       <div>
  <label className="block text-sm font-medium text-gray-300 mb-1">
    Status Status
  </label>
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    app.status === 'license' 
      ? 'bg-blue-900/50 text-blue-400' 
      : 'bg-green-900/50 text-green-400'
  }`}>
    {app.status === 'license' ? 'License' : 'Paid'}
  </span>
</div>

            {app.file_name && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Installation File
                </label>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {app.file_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {app.file_type} • {formatFileSize(app.file_size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Downloads: {app.download_count}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(app)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            )}

            {app.description && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <p className="text-white text-sm">{app.description}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <LayoutDashboard>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 bg-gray-900 min-h-screen relative">
          {/* Background Logo Transparan */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                src="/seatrium_logo_white.png"
                alt="Seatrium Background Logo"
                fill
                className="object-contain opacity-5 scale-75"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-2xl font-bold text-white">
                Applications Management
              </h1>
              <p className="text-gray-400 mt-2">
                Manage all Seatrium Applications
              </p>
            </div>

            {/* Search and Controls */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <div className="relative max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search applications by title, full name, or category..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-white bg-gray-700 placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        fetchApplications();
                        fetchIcons();
                      }}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-sm text-gray-300 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                      />
                      {isLoading ? "Loading..." : "Refresh All"}
                    </button>

                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Application
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 mb-6">
              {/* Table Header */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                {/* Table Header */}
                <div className="px-4 py-3 border-b border-gray-700 bg-gray-900">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">
                      {filteredApps.length} of {apps.length} Applications
                    </span>
                    <ShowEntriesDropdown />
                  </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">
                      Loading applications...
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-900 border-b border-gray-700">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              Application
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              Full Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              Version
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              File
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              File Size
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              Downloads
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {currentData.map((app) => {
                            const appIcon = getAppIcon(app);

                            // Debug log untuk setiap row
                            console.log(`📋 Table Row - App ${app.id}:`, {
                              title: app.title,
                              icon_id: app.icon_id,
                              icon_from_app: app.icon,
                              icon_from_getAppIcon: appIcon,
                              has_relation: !!app.icon,
                              icon_key: app.icon?.icon_key,
                              icon_type: app.icon?.type,
                            });

                            return (
                              <tr
                                key={app.id}
                                className="hover:bg-gray-700/50 transition-colors"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-900/50 rounded-lg">
                                      {/* PERBAIKAN: Gunakan AppIcon langsung dengan app object */}
                                      <AppIcon
                                        app={app}
                                        className="w-6 h-6 text-blue-400"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-medium text-white">
                                        {app.title}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        ID: {app.id} | Icon:{" "}
                                        {app.icon_id
                                          ? `ID:${app.icon_id}`
                                          : "None"}
                                        {app.icon?.icon_key &&
                                          ` (${app.icon.icon_key})`}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-white max-w-[200px] truncate">
                                  {app.full_name}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400">
                                    {app.category?.name}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-white font-medium">
                                    {app.version || "1.0.0"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {app.file_name ? (
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm text-white truncate max-w-[150px]">
                                        {app.file_name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      No file
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {app.file_size ? (
                                    <span className="text-sm text-white">
                                      {formatFileSize(app.file_size)}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      N/A
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      app.status === "license"
                                        ? "bg-blue-900/50 text-blue-400"
                                        : "bg-green-900/50 text-green-400"
                                    }`}
                                  >
                                    {app.status === "license"
                                      ? "License"
                                      : "Paid"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-white">
                                  {app.download_count}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedApp(app);
                                        setShowDetailModal(true);
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded transition-all"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditApp({
                                          id: app.id,
                                          title: app.title,
                                          fullName: app.full_name,
                                          categoryId: app.category_id,
                                          iconId: app.icon_id,
                                          version: app.version || "1.0.0",
                                          description: app.description || "",
                                          file: null,
                                        });
                                        setShowEditModal(true);
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-900/30 rounded transition-all"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    {app.file_name && (
                                      <button
                                        onClick={() => handleDownload(app)}
                                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded transition-all"
                                        title="Download File"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteApp(app)}
                                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden p-4">
                      {currentData.map((app) => (
                        <MobileAppCard key={app.id} app={app} />
                      ))}
                    </div>

                    {/* No Data State */}
                    {filteredApps.length === 0 && !isLoading && (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No applications found</p>
                        <p className="text-sm mt-1">
                          {searchQuery
                            ? "Try adjusting your search terms"
                            : "Get started by adding a new application"}
                        </p>
                      </div>
                    )}

                    {/* Pagination */}
                    {(totalPages > 1 || itemsPerPage !== 10) &&
                      filteredApps.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-700 bg-gray-900">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <ShowEntriesDropdown />
                              <p className="text-xs text-gray-300">
                                Showing{" "}
                                <span className="font-semibold">
                                  {filteredApps.length === 0
                                    ? 0
                                    : (currentPage - 1) * itemsPerPage + 1}
                                  -
                                  {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredApps.length
                                  )}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold">
                                  {filteredApps.length}
                                </span>{" "}
                                applications
                              </p>
                            </div>

                            {totalPages > 1 && (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() =>
                                    setCurrentPage((prev) =>
                                      Math.max(prev - 1, 1)
                                    )
                                  }
                                  disabled={currentPage === 1}
                                  className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  ← Prev
                                </button>
                                <button
                                  onClick={() =>
                                    setCurrentPage((prev) =>
                                      Math.min(prev + 1, totalPages)
                                    )
                                  }
                                  disabled={currentPage === totalPages}
                                  className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Next →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Detail Modal */}
          {showDetailModal && selectedApp && (
            <AppDetailModal
              app={selectedApp}
              onClose={() => setShowDetailModal(false)}
            />
          )}

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
              <div className="bg-gray-800 rounded-lg w-full max-w-xl p-6 shadow-2xl animate-fade-in relative mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition"
                  disabled={isSubmitting || isUploading}
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-100 mb-6">
                  Add New Application
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newApp.title}
                      onChange={(e) =>
                        setNewApp({ ...newApp, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                      placeholder="Enter application title"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newApp.fullName}
                      onChange={(e) =>
                        setNewApp({ ...newApp, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                      placeholder="Enter full application name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Category *
                    </label>
                    <select
                      value={newApp.categoryId}
                      onChange={(e) =>
                        setNewApp({ ...newApp, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                      disabled={isSubmitting}
                    >
                      <option value="" className="text-gray-500">
                        {categories.length === 0
                          ? "Loading categories..."
                          : "Select Category"}
                      </option>
                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                          className="text-white"
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <p className="text-xs text-yellow-500 mt-1">
                        No categories available. Please create categories first.
                      </p>
                    )}
                  </div>

                  {/* Licesense */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Application Status *
                    </label>
                    <select
                      value={newApp.status}
                      onChange={(e) =>
                        setNewApp({ ...newApp, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                      disabled={isSubmitting}
                    >
                      <option value="license" className="text-white">
                        License
                      </option>
                      <option value="paid" className="text-white">
                        Paid
                      </option>
                    </select>
                  </div>

                  {/* Icon Field - menggunakan IconDropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Application Icon
                    </label>
                    <IconDropdown
                      selectedIcon={icons.find(
                        (icon) => icon.id === parseInt(newApp.iconId)
                      )}
                      onSelectIcon={(icon) => {
                        console.log("Icon selected in add modal:", icon);
                        setNewApp({ ...newApp, iconId: icon.id.toString() });
                      }}
                      isOpen={showIconDropdown}
                      onToggle={() => {
                        setShowIconDropdown(!showIconDropdown);
                        setIconSearch("");
                      }}
                      searchQuery={iconSearch}
                      onSearchChange={setIconSearch}
                      currentIconId={newApp.iconId} // Tambah prop ini
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Choose from icon library or upload your own icon
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={newApp.version}
                      onChange={(e) =>
                        setNewApp({ ...newApp, version: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                      placeholder="1.0.0"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newApp.description}
                      onChange={(e) =>
                        setNewApp({ ...newApp, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                      placeholder="Enter application description"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Installation File
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        onChange={(e) =>
                          setNewApp({ ...newApp, file: e.target.files[0] })
                        }
                        className="hidden"
                        id="file-upload"
                        accept=".exe,.msi,.dmg,.pkg,.deb,.rpm,.apk,.ipa,.zip,.rar,.7z,.tar,.gz"
                        disabled={isSubmitting || isUploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center text-center"
                      >
                        {newApp.file ? (
                          <>
                            <FileText className="w-8 h-8 text-blue-400 mb-2" />
                            <span className="text-sm text-blue-400 font-medium">
                              {newApp.file.name}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              Size: {formatFileSize(newApp.file.size)}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              Click to change file
                            </span>
                          </>
                        ) : (
                          <>
                            <Download className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-400">
                              <span className="text-blue-400 font-medium">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              Supported formats: EXE, MSI, DMG, PKG, DEB, RPM,
                              APK, IPA, ZIP, RAR, 7Z, TAR, GZ
                            </span>
                          </>
                        )}
                      </label>
                    </div>

                    {isUploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Please wait while your file is being uploaded...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={isSubmitting || isUploading}
                    className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateApp}
                    disabled={
                      isSubmitting || isUploading || categories.length === 0
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading... ({uploadProgress}%)
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Application"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
              <div className="bg-gray-800 rounded-lg w-full max-w-xl p-6 shadow-2xl animate-fade-in relative mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition"
                  disabled={isSubmitting || isUploading}
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-100 mb-6">
                  Edit Application: {editApp.title}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editApp.title}
                      onChange={(e) =>
                        setEditApp({ ...editApp, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editApp.fullName}
                      onChange={(e) =>
                        setEditApp({ ...editApp, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Category *
                    </label>
                    <select
                      value={editApp.categoryId}
                      onChange={(e) =>
                        setEditApp({ ...editApp, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                      disabled={isSubmitting}
                    >
                      <option value="" className="text-gray-500">
                        {categories.length === 0
                          ? "Loading categories..."
                          : "Select Category"}
                      </option>
                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                          className="text-white"
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* license*/}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Application Status *
                    </label>
                    <select
                      value={editApp.status}
                      onChange={(e) =>
                        setEditApp({ ...editApp, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                      disabled={isSubmitting}
                    >
                      <option value="license" className="text-white">
                        License
                      </option>
                      <option value="paid" className="text-white">
                        Paid
                      </option>
                    </select>
                  </div>

                  {/* Icon Field - menggunakan IconDropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Application Icon
                    </label>
                    <IconDropdown
                      selectedIcon={icons.find(
                        (icon) => icon.id === parseInt(editApp.iconId)
                      )}
                      onSelectIcon={(icon) => {
                        console.log("Icon selected in edit modal:", icon);
                        setEditApp({ ...editApp, iconId: icon.id.toString() });
                      }}
                      isOpen={showEditIconDropdown}
                      onToggle={() => {
                        setShowEditIconDropdown(!showEditIconDropdown);
                        setEditIconSearch("");
                      }}
                      searchQuery={editIconSearch}
                      onSearchChange={setEditIconSearch}
                      isEdit={true}
                      currentIconId={editApp.iconId} // Tambah prop ini
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Choose from icon library or upload your own icon
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={editApp.version}
                      onChange={(e) =>
                        setEditApp({ ...editApp, version: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editApp.description}
                      onChange={(e) =>
                        setEditApp({ ...editApp, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Update Installation File
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        onChange={(e) =>
                          setEditApp({ ...editApp, file: e.target.files[0] })
                        }
                        className="hidden"
                        id="edit-file-upload"
                        accept=".exe,.msi,.dmg,.pkg,.deb,.rpm,.apk,.ipa,.zip,.rar,.7z,.tar,.gz"
                        disabled={isSubmitting || isUploading}
                      />
                      <label
                        htmlFor="edit-file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center text-center"
                      >
                        {editApp.file ? (
                          <>
                            <FileText className="w-8 h-8 text-blue-400 mb-2" />
                            <span className="text-sm text-blue-400 font-medium">
                              {editApp.file.name}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              Size: {formatFileSize(editApp.file.size)}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              Click to change file
                            </span>
                          </>
                        ) : (
                          <>
                            <Download className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-400">
                              <span className="text-blue-400 font-medium">
                                Click to upload
                              </span>{" "}
                              new file
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              Upload new file to replace existing one
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Leave empty to keep the current file
                    </p>

                    {isUploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Please wait while your file is being uploaded...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={isSubmitting || isUploading}
                    className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateApp}
                    disabled={isSubmitting || isUploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading... ({uploadProgress}%)
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      "Update Application"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
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
