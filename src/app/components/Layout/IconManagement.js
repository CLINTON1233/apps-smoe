"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:5000";

// Dynamic icon component
const DynamicIcon = ({ iconName, ...props }) => {
  const IconComponent = LucideIcons[iconName];
  if (!IconComponent) {
    return <LucideIcons.HelpCircle {...props} />;
  }
  return <IconComponent {...props} />;
};

export const IconManagement = ({
  selectedIcon,
  onSelectIcon,
  onUploadIcon,
  mode = "select", // 'select' or 'manage'
}) => {
  const [icons, setIcons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newIconName, setNewIconName] = useState("");
  const [customIconFile, setCustomIconFile] = useState(null);

  // Fetch icons from API
  const fetchIcons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/icons`);
      if (!response.ok) throw new Error("Failed to fetch icons");
      
      const result = await response.json();
      if (result.status === "success") {
        setIcons(result.data || []);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load icons",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  // Filter icons based on search
  const filteredIcons = icons.filter(icon =>
    icon.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.value?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle icon selection
  const handleIconSelect = (icon) => {
    if (onSelectIcon) {
      onSelectIcon(icon);
    }
  };

  // Handle custom icon upload
  const handleCustomIconUpload = async () => {
    if (!customIconFile || !newIconName.trim()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please provide both icon name and file",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", customIconFile);
      formData.append("name", newIconName.trim());

      const response = await fetch(`${API_BASE_URL}/icons/custom`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        const newIcon = result.data;
        setIcons(prev => [...prev, newIcon]);
        setCustomIconFile(null);
        setNewIconName("");
        setShowUploadModal(false);

        Swal.fire({
          title: "Success!",
          text: "Custom icon uploaded successfully",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });

        if (onUploadIcon) {
          onUploadIcon(newIcon);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error uploading custom icon:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to upload custom icon",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle icon deletion
  const handleDeleteIcon = async (icon) => {
    const result = await Swal.fire({
      title: `Delete ${icon.name}?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/icons/${icon.id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.status === "success") {
          setIcons(prev => prev.filter(i => i.id !== icon.id));
          
          // If deleted icon was selected, clear selection
          if (selectedIcon?.id === icon.id && onSelectIcon) {
            onSelectIcon(null);
          }

          Swal.fire({
            title: "Deleted!",
            text: `${icon.name} has been deleted.`,
            icon: "success",
            confirmButtonColor: "#3b82f6",
          });
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete icon.",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      {/* Search and Upload Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search icons..."
            className="w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-white bg-gray-700 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {mode === "manage" && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Upload Icon
          </button>
        )}
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-96 overflow-y-auto p-2">
        {filteredIcons.map((icon) => (
          <div
            key={icon.id}
            className={`relative group flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer ${
              selectedIcon?.id === icon.id
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => handleIconSelect(icon)}
          >
            {/* Icon Display */}
            <div className="flex items-center justify-center w-8 h-8 mb-2">
              {icon.type === "system" ? (
                <DynamicIcon iconName={icon.value} className="w-6 h-6" />
              ) : icon.file_path ? (
                <Image
                  src={`/${icon.file_path}`}
                  alt={icon.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    console.error("Failed to load icon image:", icon.file_path);
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>

            {/* Icon Name */}
            <span className="text-xs text-center truncate w-full">
              {icon.name}
            </span>

            {/* Selection Checkmark */}
            {selectedIcon?.id === icon.id && (
              <div className="absolute top-1 right-1">
                <Check className="w-3 h-3" />
              </div>
            )}

            {/* Delete Button (Manage Mode) */}
            {mode === "manage" && icon.type === "custom" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteIcon(icon);
                }}
                className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* No Icons State */}
      {filteredIcons.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">
            {searchQuery ? "No icons found" : "No icons available"}
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition"
              disabled={uploading}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-100 mb-4">
              Upload Custom Icon
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Icon Name *
                </label>
                <input
                  type="text"
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                  placeholder="Enter icon name"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Icon File *
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setCustomIconFile(e.target.files[0])}
                    className="hidden"
                    id="icon-upload"
                    accept=".png,.jpg,.jpeg,.svg,.ico,.webp,.gif"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="icon-upload"
                    className="cursor-pointer flex flex-col items-center justify-center text-center"
                  >
                    {customIconFile ? (
                      <>
                        <ImageIcon className="w-8 h-8 text-blue-400 mb-2" />
                        <span className="text-sm text-blue-400 font-medium">
                          {customIconFile.name}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          Size: {formatFileSize(customIconFile.size)}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          Click to change file
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">
                          <span className="text-blue-400 font-medium">
                            Click to upload
                          </span>{" "}
                          custom icon
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Supported formats: PNG, JPG, JPEG, SVG, ICO, WEBP, GIF
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomIconUpload}
                disabled={uploading || !customIconFile || !newIconName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Icon"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook untuk menggunakan icon management
export const useIconManagement = () => {
  const [icons, setIcons] = useState([]);

  const fetchIcons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/icons`);
      if (!response.ok) throw new Error("Failed to fetch icons");
      
      const result = await response.json();
      if (result.status === "success") {
        setIcons(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
    }
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  return { icons, refreshIcons: fetchIcons };
};