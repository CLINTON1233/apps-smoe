"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import LayoutDashboard from "../components/Layout/LayoutDashboard";
import Swal from "sweetalert2";
import Image from "next/image";
import * as LucideIcons from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

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
  const [icons, setIcons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [customIconFile, setCustomIconFile] = useState(null);

  // Form states
  const [newApp, setNewApp] = useState({
    title: "",
    fullName: "",
    categoryId: "",
    iconId: "",
    version: "1.0.0",
    description: "",
    file: null,
  });

  const [editApp, setEditApp] = useState({
    id: null,
    title: "",
    fullName: "",
    categoryId: "",
    iconId: "",
    version: "1.0.0",
    description: "",
    file: null,
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

  // Fetch applications
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
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log("Fetching categories from:", `${API_BASE_URL}/categories`);

      const response = await fetch(`${API_BASE_URL}/categories`);

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
      });
    }
  };

  // Fetch icons
  const fetchIcons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/icons`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Icons Response:", result);

      if (result.status === "success") {
        setIcons(result.data || []);
        console.log("Icons loaded:", result.data);
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
    }
  };

  // Get icon data for app
  const getAppIcon = (app) => {
    if (!app.icon_id) return null;
    return icons.find((icon) => icon.id === parseInt(app.icon_id));
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

  // Handle icon selection
  const handleIconSelect = (icon) => {
    if (showAddModal) {
      setNewApp({ ...newApp, iconId: icon.id });
    } else if (showEditModal) {
      setEditApp({ ...editApp, iconId: icon.id });
    }
    setSelectedIcon(icon);
    setShowIconModal(false);
  };

  // Handle custom icon upload
  const handleCustomIconUpload = async () => {
    if (!customIconFile) {
      Swal.fire({
        title: "Error",
        text: "Please select a file to upload",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", customIconFile);

    try {
      const response = await fetch(`${API_BASE_URL}/icons/custom`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        const newIcon = result.data;
        setIcons([...icons, newIcon]);
        handleIconSelect(newIcon);
        setCustomIconFile(null);

        Swal.fire({
          title: "Success!",
          text: "Custom icon uploaded successfully",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
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
        background: "#1f2937",
        color: "#f9fafb",
      });
    }
  };

  // Get selected icon data
  const getSelectedIconData = () => {
    const iconId = showAddModal ? newApp.iconId : editApp.iconId;
    return icons.find((icon) => icon.id === parseInt(iconId));
  };

  // Handle Create Application - UPDATE UNTUK ICON
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

      const formData = new FormData();
      formData.append("title", newApp.title);
      formData.append("fullName", newApp.fullName);
      formData.append("categoryId", newApp.categoryId);
      formData.append("iconId", newApp.iconId || "");
      formData.append("version", newApp.version);
      formData.append("description", newApp.description);

      if (newApp.file) {
        formData.append("file", newApp.file);
      }

      // Gunakan XMLHttpRequest untuk track progress
      const xhr = new XMLHttpRequest();

      const response = await new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(
              new Error(
                xhr.responseText
                  ? JSON.parse(xhr.responseText).message
                  : "Upload failed"
              )
            );
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", `${API_BASE_URL}/applications`);
        xhr.send(formData);
      });

      const result = response;

      if (result.status === "success") {
        setShowAddModal(false);
        setNewApp({
          title: "",
          fullName: "",
          categoryId: "",
          iconId: "",
          version: "1.0.0",
          description: "",
          file: null,
        });
        setSelectedIcon(null);
        setUploadProgress(0);
        await fetchApplications();

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
        text: "Failed to create application",
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

  // Handle Update Application - UPDATE UNTUK ICON
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

      const formData = new FormData();
      formData.append("title", editApp.title);
      formData.append("fullName", editApp.fullName);
      formData.append("categoryId", editApp.categoryId);
      formData.append("iconId", editApp.iconId || "");
      formData.append("version", editApp.version);
      formData.append("description", editApp.description);

      if (editApp.file) {
        formData.append("file", editApp.file);
      }

      // Gunakan XMLHttpRequest untuk track progress
      const xhr = new XMLHttpRequest();

      const response = await new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(
              new Error(
                xhr.responseText
                  ? JSON.parse(xhr.responseText).message
                  : "Upload failed"
              )
            );
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("PUT", `${API_BASE_URL}/applications/${editApp.id}`);
        xhr.send(formData);
      });

      const result = response;

      if (result.status === "success") {
        setShowEditModal(false);
        setUploadProgress(0);
        await fetchApplications();

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
        text: "Failed to update application",
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
        const response = await fetch(`${API_BASE_URL}/applications/${app.id}`, {
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

      // Gunakan GET request untuk download
      const response = await fetch(
        `${API_BASE_URL}/applications/${app.id}/download`,
        {
          method: "GET",
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      console.log("Download response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Download failed: ${response.status} ${response.statusText}`
        );
      }

      // Get the blob from response
      const blob = await response.blob();
      console.log("Blob received, size:", blob.size);

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

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
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });

      // Refresh applications to update download count
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

  // Icon Selection Modal Component
  const IconSelectionModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] px-3">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl p-6 shadow-2xl animate-fade-in relative mx-auto border border-gray-700 max-h-[80vh] overflow-y-auto">
        <button
          onClick={() => setShowIconModal(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-100 mb-6">
          Select Application Icon
        </h2>

        {/* Custom Icon Upload Section */}
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">
            Upload Custom Icon
          </h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Upload Icon File
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setCustomIconFile(e.target.files[0])}
                  className="hidden"
                  id="icon-upload"
                  accept=".png,.jpg,.jpeg,.svg,.ico,.webp"
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
                        Supported formats: PNG, JPG, JPEG, SVG, ICO, WEBP
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
            <button
              onClick={handleCustomIconUpload}
              disabled={!customIconFile}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* System Icons Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-3">
            System Icons
          </h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 max-h-96 overflow-y-auto p-2">
            {icons
              .filter((icon) => icon.type === "system")
              .map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleIconSelect(icon)}
                  className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                    selectedIcon?.id === icon.id
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <DynamicIcon iconName={icon.value} className="w-5 h-5 mb-1" />
                  <span className="text-xs truncate w-full text-center">
                    {icon.name}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Custom Icons Grid */}
        {icons.filter((icon) => icon.type === "custom").length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">
              Custom Icons
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 max-h-96 overflow-y-auto p-2">
              {icons
                .filter((icon) => icon.type === "custom")
                .map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => handleIconSelect(icon)}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                      selectedIcon?.id === icon.id
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {icon.file_path ? (
                      <Image
                        src={`/${icon.file_path}`}
                        alt={icon.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 mb-1 object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 mb-1" />
                    )}
                    <span className="text-xs truncate w-full text-center">
                      {icon.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Card View
  const MobileAppCard = ({ app }) => {
    const appIcon = getAppIcon(app);

    return (
      <div className="bg-gray-800 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/50 rounded-lg">
              {appIcon ? (
                appIcon.type === "system" ? (
                  <DynamicIcon
                    iconName={appIcon.value}
                    className="w-6 h-6 text-blue-400"
                  />
                ) : appIcon.file_path ? (
                  <Image
                    src={`/${appIcon.file_path}`}
                    alt={appIcon.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                )
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
            <span className="text-gray-400">Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                app.status === "active"
                  ? "bg-green-900/50 text-green-400"
                  : "bg-red-900/50 text-red-400"
              }`}
            >
              {app.status}
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
                appIcon.type === "system" ? (
                  <DynamicIcon
                    iconName={appIcon.value}
                    className="w-8 h-8 text-blue-400"
                  />
                ) : appIcon.file_path ? (
                  <Image
                    src={`/${appIcon.file_path}`}
                    alt={appIcon.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                )
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
                Status
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  app.status === "active"
                    ? "bg-green-900/50 text-green-400"
                    : "bg-red-900/50 text-red-400"
                }`}
              >
                {app.status}
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
    <LayoutDashboard>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 bg-gray-900 min-h-screen relative">
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
                    onClick={fetchApplications}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-sm text-gray-300"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    {isLoading ? "Loading..." : "Refresh"}
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

                          return (
                            <tr
                              key={app.id}
                              className="hover:bg-gray-700/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-900/50 rounded-lg">
                                    {appIcon ? (
                                      appIcon.type === "system" ? (
                                        <DynamicIcon
                                          iconName={appIcon.value}
                                          className="w-6 h-6 text-blue-400"
                                        />
                                      ) : appIcon.file_path ? (
                                        <Image
                                          src={`/${appIcon.file_path}`}
                                          alt={appIcon.name}
                                          width={24}
                                          height={24}
                                          className="w-6 h-6 object-contain"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">
                                            A
                                          </span>
                                        </div>
                                      )
                                    ) : (
                                      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                          A
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {app.title}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      ID: {app.id}
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
                                    app.status === "active"
                                      ? "bg-green-900/50 text-green-400"
                                      : "bg-red-900/50 text-red-400"
                                  }`}
                                >
                                  {app.status}
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

        {/* Add Modal - DENGAN FIELD ICON */}
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

                {/* Icon Selection Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Application Icon
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowIconModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-sm text-gray-300 bg-gray-700"
                    >
                      {getSelectedIconData() ? (
                        <>
                          {getSelectedIconData().type === "system" ? (
                            <DynamicIcon
                              iconName={getSelectedIconData().value}
                              className="w-4 h-4"
                            />
                          ) : (
                            <Image
                              src={`/${getSelectedIconData().file_path}`}
                              alt={getSelectedIconData().name}
                              width={16}
                              height={16}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          <span>{getSelectedIconData().name}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4" />
                          <span>Select Icon</span>
                        </>
                      )}
                    </button>
                    {getSelectedIconData() && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewApp({ ...newApp, iconId: "" });
                          setSelectedIcon(null);
                        }}
                        className="px-3 py-2 text-red-400 hover:text-red-300 transition text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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

        {/* Edit Modal - DENGAN FIELD ICON */}
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

                {/* Icon Selection Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Application Icon
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowIconModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-sm text-gray-300 bg-gray-700"
                    >
                      {getSelectedIconData() ? (
                        <>
                          {getSelectedIconData().type === "system" ? (
                            <DynamicIcon
                              iconName={getSelectedIconData().value}
                              className="w-4 h-4"
                            />
                          ) : (
                            <Image
                              src={`/${getSelectedIconData().file_path}`}
                              alt={getSelectedIconData().name}
                              width={16}
                              height={16}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          <span>{getSelectedIconData().name}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4" />
                          <span>Select Icon</span>
                        </>
                      )}
                    </button>
                    {getSelectedIconData() && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditApp({ ...editApp, iconId: "" });
                          setSelectedIcon(null);
                        }}
                        className="px-3 py-2 text-red-400 hover:text-red-300 transition text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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

        {/* Icon Selection Modal */}
        {showIconModal && <IconSelectionModal />}
      </div>
      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-400 text-sm border-t border-gray-700/50 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <p>IT Applications Dashboard</p>
          <p className="mt-1">seatrium.com</p>
        </div>
      </footer>
    </LayoutDashboard>
  );
}
