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
} from "lucide-react";
import LayoutDashboard from "../components/Layout/LayoutDashboard";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:5000";

export default function AdminApplicationsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newApp, setNewApp] = useState({
    title: "",
    fullName: "",
    categoryId: "",
    version: "1.0.0",
    description: "",
    file: null,
  });

  const [editApp, setEditApp] = useState({
    id: null,
    title: "",
    fullName: "",
    categoryId: "",
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
        confirmButtonColor: "#1e40af",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      Swal.fire({
        title: "Error",
        text: `Failed to load categories: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#1e40af",
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchApplications();
    fetchCategories();
  }, []);

  // Filter data
  const filteredApps = apps.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition"
      >
        Show {itemsPerPage === filteredApps.length ? "All" : itemsPerPage}
        <ChevronDown className="w-3 h-3" />
      </button>

      {showEntriesDropdown && (
        <div className="absolute bottom-full mb-1 left-0 w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {entriesOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleItemsPerPageChange(option)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 transition ${
                itemsPerPage ===
                (option === "All" ? filteredApps.length : option)
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700"
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
    try {
      if (!newApp.title || !newApp.fullName || !newApp.categoryId) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields",
          icon: "warning",
          confirmButtonColor: "#1e40af",
        });
        return;
      }

      const formData = new FormData();
      formData.append("title", newApp.title);
      formData.append("fullName", newApp.fullName);
      formData.append("categoryId", newApp.categoryId);
      formData.append("version", newApp.version);
      formData.append("description", newApp.description);

      if (newApp.file) {
        formData.append("file", newApp.file);
      }

      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        setShowAddModal(false);
        setNewApp({
          title: "",
          fullName: "",
          categoryId: "",
          version: "1.0.0",
          description: "",
          file: null,
        });
        fetchApplications();

        Swal.fire({
          title: "Success!",
          text: "Application created successfully",
          icon: "success",
          confirmButtonColor: "#1e40af",
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
        confirmButtonColor: "#1e40af",
      });
    }
  };

  // Handle Update Application
  const handleUpdateApp = async () => {
    try {
      if (!editApp.title || !editApp.fullName || !editApp.categoryId) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields",
          icon: "warning",
          confirmButtonColor: "#1e40af",
        });
        return;
      }

      const formData = new FormData();
      formData.append("title", editApp.title);
      formData.append("fullName", editApp.fullName);
      formData.append("categoryId", editApp.categoryId);
      formData.append("version", editApp.version);
      formData.append("description", editApp.description);

      if (editApp.file) {
        formData.append("file", editApp.file);
      }
      const response = await fetch(
        `${API_BASE_URL}/applications/${editApp.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setShowEditModal(false);
        fetchApplications();

        Swal.fire({
          title: "Success!",
          text: "Application updated successfully",
          icon: "success",
          confirmButtonColor: "#1e40af",
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
        confirmButtonColor: "#1e40af",
      });
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
            confirmButtonColor: "#1e40af",
          });
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete application.",
          icon: "error",
          confirmButtonColor: "#1e40af",
        });
      }
    }
  };

  // Handle File Download - PERBAIKAN DOWNLOAD
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

  // Mobile Card View
  const MobileAppCard = ({ app }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/30 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{app.title}</h3>
            <p className="text-xs text-gray-500">ID: {app.id}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {
              setSelectedApp(app);
              setShowDetailModal(true);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-all"
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
                version: app.version || "1.0.0",
                description: app.description || "",
                file: null,
              });
              setShowEditModal(true);
            }}
            className="p-1 text-gray-400 hover:text-green-600 rounded transition-all"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleDeleteApp(app)}
            className="p-1 text-gray-400 hover:text-red-600 rounded transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Full Name:</span>
          <span className="text-gray-900 font-medium">{app.full_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Category:</span>
          <span className="text-gray-900 font-medium">
            {app.category?.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Version:</span>
          <span className="text-gray-900 font-medium">
            {app.version || "1.0.0"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              app.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {app.status}
          </span>
        </div>
        {app.file_name && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">File:</span>
              <span className="text-gray-900 font-medium">{app.file_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">File Size:</span>
              <span className="text-gray-900 font-medium">
                {formatFileSize(app.file_size)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Download:</span>
              <button
                onClick={() => handleDownload(app)}
                className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
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

  // Detail Modal Component
  const AppDetailModal = ({ app, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl animate-fade-in relative mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Application Details
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <p className="text-gray-900">{app.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <p className="text-gray-900">{app.full_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <p className="text-gray-900">{app.category?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version
            </label>
            <p className="text-gray-900">{app.version || "1.0.0"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                app.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {app.status}
            </span>
          </div>

          {app.file_name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Installation File
              </label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {app.file_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {app.file_type} • {formatFileSize(app.file_size)}
                  </p>
                  <p className="text-xs text-gray-500">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-gray-900 text-sm">{app.description}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <LayoutDashboard>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">
            Applications Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all Seatrium Applications</p>
        </div>
        {/* Search and Controls */}

        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex-1 w-full">
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search applications by title, full name, or category..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={fetchApplications}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700"
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

        {/* Table Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/30 mb-6">
          {/* Table Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {filteredApps.length} of {apps.length} Applications
                </span>
                <ShowEntriesDropdown />
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">
                  Loading applications...
                </span>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Application
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Full Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Version
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          File
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          File Size
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Downloads
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentData.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    A
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {app.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {app.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                            {app.full_name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {app.category?.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900 font-medium">
                              {app.version || "1.0.0"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {app.file_name ? (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900 truncate max-w-[150px]">
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
                              <span className="text-sm text-gray-900">
                                {formatFileSize(app.file_size)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                app.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {app.download_count}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowDetailModal(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
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
                                    version: app.version || "1.0.0",
                                    description: app.description || "",
                                    file: null,
                                  });
                                  setShowEditModal(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {app.file_name && (
                                <button
                                  onClick={() => handleDownload(app)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                  title="Download File"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteApp(app)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                  <div className="text-center py-12 text-gray-400">
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
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ShowEntriesDropdown />
                          <p className="text-xs text-gray-700">
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
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Add Modal - PERBAIKAN WARNA FONT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl animate-fade-in relative mx-auto max-h-[90vh] overflow-y-auto">
            {/* <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button> */}

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add New Application
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newApp.title}
                  onChange={(e) =>
                    setNewApp({ ...newApp, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter application title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newApp.fullName}
                  onChange={(e) =>
                    setNewApp({ ...newApp, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter full application name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={newApp.categoryId}
                  onChange={(e) =>
                    setNewApp({ ...newApp, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">
                    Select Category
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="text-gray-900"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={newApp.version}
                  onChange={(e) =>
                    setNewApp({ ...newApp, version: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newApp.description}
                  onChange={(e) =>
                    setNewApp({ ...newApp, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter application description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Installation File
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewApp({ ...newApp, file: e.target.files[0] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-gray-900"
                  accept=".exe,.msi,.dmg,.pkg,.deb,.rpm,.apk,.ipa,.zip,.rar,.7z,.tar,.gz"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: EXE, MSI, DMG, PKG, DEB, RPM, APK, IPA,
                  ZIP, RAR, 7Z, TAR, GZ
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApp}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Create Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - PERBAIKAN WARNA FONT */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl animate-fade-in relative mx-auto max-h-[90vh] overflow-y-auto">
            {/* <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button> */}

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Edit Application
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editApp.title}
                  onChange={(e) =>
                    setEditApp({ ...editApp, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editApp.fullName}
                  onChange={(e) =>
                    setEditApp({ ...editApp, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={editApp.categoryId}
                  onChange={(e) =>
                    setEditApp({ ...editApp, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">
                    Select Category
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="text-gray-900"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={editApp.version}
                  onChange={(e) =>
                    setEditApp({ ...editApp, version: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editApp.description}
                  onChange={(e) =>
                    setEditApp({ ...editApp, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Installation File
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setEditApp({ ...editApp, file: e.target.files[0] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-gray-900"
                  accept=".exe,.msi,.dmg,.pkg,.deb,.rpm,.apk,.ipa,.zip,.rar,.7z,.tar,.gz"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload new file to replace existing one
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateApp}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Update Application
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutDashboard>
  );
}
