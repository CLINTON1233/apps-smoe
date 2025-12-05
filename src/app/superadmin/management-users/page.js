"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  User,
  Filter,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  ChevronDown,
  X,
} from "lucide-react";
import { Poppins } from "next/font/google";
import Swal from "sweetalert2";
import LayoutDashboard from "../componentsSuperAdmin/Layout/LayoutDashboard";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import { API_ENDPOINTS } from "../../../config/api"; // Import konfigurasi API

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function AdminManagementUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    badge: "",
    telp: "",
    departemen: "",
    role: "guest",
  });

  // Entries options
  const entriesOptions = [10, 25, 50, 100, 200, "All"];

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch users menggunakan konfigurasi API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users from:", API_ENDPOINTS.USERS);

      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.status === "success") {
        setUsers(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "Failed to load users. Please check if the server is running.",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    if (value === "All") {
      setItemsPerPage(filteredUsers.length);
    } else {
      setItemsPerPage(value);
    }
    setCurrentPage(1);
    setShowEntriesDropdown(false);
  };

  // Handle add new user menggunakan konfigurasi API
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      console.log("Adding new user:", formData);

      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Add user response:", result);

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User created successfully!",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#f9fafb",
        });
        setShowAddModal(false);
        resetForm();
        await fetchUsers();
      } else {
        throw new Error(result.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create user. Please try again.",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit user menggunakan konfigurasi API
  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!selectedUser || submitting) return;

    setSubmitting(true);

    try {
      const updateData = { ...formData };
      // Remove password if empty to keep current password
      if (!updateData.password) {
        delete updateData.password;
      }

      console.log("Updating user:", selectedUser.id, updateData);

      const response = await fetch(API_ENDPOINTS.USER_BY_ID(selectedUser.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log("Update user response:", result);

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User updated successfully!",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#f9fafb",
        });
        setShowEditModal(false);
        resetForm();
        await fetchUsers();
      } else {
        throw new Error(result.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update user. Please try again.",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete user menggunakan konfigurasi API
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      background: "#1f2937",
      color: "#f9fafb",
    });

    if (result.isConfirmed) {
      try {
        console.log("Deleting user:", userId);

        const response = await fetch(API_ENDPOINTS.USER_BY_ID(userId), {
          method: "DELETE",
        });

        const data = await response.json();
        console.log("Delete user response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          );
        }

        if (data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User has been deleted.",
            confirmButtonColor: "#1e40af",
            background: "#1f2937",
            color: "#f9fafb",
          });
          await fetchUsers();
        } else {
          throw new Error(data.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete user. Please try again.",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#f9fafb",
        });
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: "",
      email: "",
      password: "",
      badge: "",
      telp: "",
      departemen: "",
      role: "guest",
    });
    setSelectedUser(null);
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      nama: user.nama || "",
      email: user.email || "",
      password: "",
      badge: user.badge || "",
      telp: user.telp || "",
      departemen: user.departemen || "",
      role: user.role || "guest",
    });
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.departemen?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Show Entries Dropdown Component
  const ShowEntriesDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowEntriesDropdown(!showEntriesDropdown)}
        className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-600 rounded-lg bg-gray-700 text-gray-100 hover:bg-gray-600 transition"
      >
        Show {itemsPerPage === filteredUsers.length ? "All" : itemsPerPage}
        <ChevronDown className="w-3 h-3" />
      </button>

      {showEntriesDropdown && (
        <div className="absolute bottom-full mb-1 left-0 w-20 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
          {entriesOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleItemsPerPageChange(option)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-600 hover:text-blue-400 transition ${
                itemsPerPage ===
                (option === "All" ? filteredUsers.length : option)
                  ? "bg-gray-600 text-blue-400"
                  : "text-gray-100"
              }`}
            >
              {option === "All" ? "All" : option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // User Detail Modal Component
  const UserDetailModal = ({ user, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] px-3 py-4">
        <div
          className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-2xl animate-fade-in relative mx-auto border border-gray-700 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-gray-100 mb-6 text-center">
            User Details
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-100 mb-3 text-sm">
                Basic Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg flex-shrink-0">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-gray-400 text-xs block">Name</label>
                    <p className="font-semibold text-gray-100 truncate">
                      {user.nama || "No Name"}
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-400 text-xs block">Email</label>
                  <p className="font-semibold text-gray-100 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-400 text-xs block">Role</label>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-700 text-purple-100"
                        : user.role === "superadmin"
                        ? "bg-red-700 text-red-100"
                        : "bg-blue-700 text-blue-100"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-400 text-xs block">User ID</label>
                  <p className="font-semibold text-gray-100">{user.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-100 mb-3 text-sm">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-400 text-xs block">
                    Badge Number
                  </label>
                  <p className="font-semibold text-gray-100">
                    {user.badge || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-xs block">Phone</label>
                  <p className="font-semibold text-gray-100">
                    {user.telp || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-xs block">
                    Department
                  </label>
                  <p className="font-semibold text-gray-100">
                    {user.departemen || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-100 mb-3 text-sm">
                Account Information
              </h3>
              <div className="text-sm">
                <label className="text-gray-400 text-xs block">
                  Created Date
                </label>
                <p className="font-semibold text-gray-100">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-lg hover:bg-gray-700 transition flex-1"
            >
              Close
            </button>
            <button
              onClick={() => {
                openEditModal(user);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition flex-1 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile User Card Component
  const MobileUserCard = ({ user }) => {
    return (
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-700/30 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-700/50 rounded-lg flex-shrink-0">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => openDetailModal(user)}
                className="text-left hover:text-blue-400 transition-colors"
              >
                <h3 className="text-sm font-bold text-gray-100 truncate">
                  {user.nama || "No Name"}
                </h3>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={() => openDetailModal(user)}
              className="p-1 text-gray-500 hover:text-blue-400 rounded transition-all"
              title="View Details"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => openEditModal(user)}
              className="p-1 text-gray-500 hover:text-green-400 rounded transition-all"
              title="Edit User"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteUser(user.id)}
              className="p-1 text-gray-500 hover:text-red-400 rounded transition-all"
              title="Delete User"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Badge</span>
            <span className="text-gray-100">{user.badge || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Phone</span>
            <span className="text-gray-100">{user.telp || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Department</span>
            <span className="text-gray-100">{user.departemen || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Role</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user.role === "admin"
                  ? "bg-purple-700 text-purple-100"
                  : user.role === "superadmin"
                  ? "bg-red-700 text-red-100"
                  : "bg-blue-700 text-blue-100"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
          <span className="text-xs text-gray-500">
            Created: {new Date(user.created_at).toLocaleDateString("en-US")}
          </span>
          <span className="text-xs text-gray-500">ID: {user.id}</span>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <LayoutDashboard>
        {/* Main Content */}
        <div className="min-h-screen bg-gray-900 text-gray-100 relative">
          {/* Background Logo */}
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
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-2xl font-bold text-gray-100">
                  User Management
                </h1>
                <p className="text-gray-400 mt-2">
                  Manage all users and their roles in the system
                </p>
              </div>

              {/* Search and Actions */}
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <div className="relative max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, badge, or department..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-700 text-gray-100 placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-sm text-gray-100 bg-gray-800"
                      onClick={fetchUsers}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                      />
                      {loading ? "Loading..." : "Refresh"}
                    </button>

                    <button
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition text-sm"
                      onClick={openAddModal}
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4" />
                      Add New User
                    </button>
                  </div>
                </div>
              </div>

              {/* Users Table/Cards */}
              <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                {/* Table Header */}
                <div className="px-4 py-3 border-b border-gray-700 bg-gray-700 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-100">
                      {filteredUsers.length} of {users.length} Users
                    </span>
                    <ShowEntriesDropdown />
                  </div>
                </div>

                {/* Loading State */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">Loading users...</span>
                  </div>
                ) : !isMobile ? (
                  /* Desktop Table */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-700 border-b border-gray-600">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                            Badge
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700 bg-gray-800">
                        {currentData.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-700/50 rounded-lg">
                                  <User className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                  <button
                                    onClick={() => openDetailModal(user)}
                                    className="text-left hover:text-blue-400 transition-colors"
                                  >
                                    <div className="font-medium text-gray-100">
                                      {user.nama || "No Name"}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      ID: {user.id}
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-100">
                              {user.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-100">
                              {user.badge || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-100">
                              {user.telp || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-100">
                              {user.departemen || "-"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === "admin"
                                    ? "bg-purple-700 text-purple-100"
                                    : user.role === "superadmin"
                                    ? "bg-red-700 text-red-100"
                                    : "bg-blue-700 text-blue-100"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openDetailModal(user)}
                                  className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-700 rounded transition-all"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-gray-700 rounded transition-all"
                                  title="Edit User"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-all"
                                  title="Delete User"
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
                ) : (
                  /* Mobile Cards View */
                  <div className="p-4">
                    {currentData.map((user) => (
                      <MobileUserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}

                {/* No Data State */}
                {filteredUsers.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No users found</p>
                    <p className="text-sm mt-1">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Get started by adding a new user"}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {(totalPages > 1 || itemsPerPage !== 10) &&
                  filteredUsers.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-700 bg-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ShowEntriesDropdown />
                          <p className="text-xs text-gray-300">
                            Showing{" "}
                            <span className="font-semibold">
                              {filteredUsers.length === 0
                                ? 0
                                : (currentPage - 1) * itemsPerPage + 1}
                              -
                              {Math.min(
                                currentPage * itemsPerPage,
                                filteredUsers.length
                              )}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold">
                              {filteredUsers.length}
                            </span>{" "}
                            Users
                          </p>
                        </div>

                        {totalPages > 1 && (
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-xs font-medium text-gray-100 bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              className="px-3 py-1 text-xs font-medium text-gray-100 bg-gray-600 border border-gray-500 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Next →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedUser && (
          <UserDetailModal
            user={selectedUser}
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
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-100 mb-6">
                Add New User
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    placeholder="Enter user's full name"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    placeholder="Enter secure password"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter badge number (optional)"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="telp"
                    value={formData.telp}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter phone number (optional)"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="departemen"
                    value={formData.departemen}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter department name (optional)"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                  >
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    "Add User"
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
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-100 mb-6">
                Edit User: {formData.nama}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    placeholder="Enter user's full name"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-600 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter new password to change (leave blank to keep current)"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter badge number"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="telp"
                    value={formData.telp}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="departemen"
                    value={formData.departemen}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter department name"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                  >
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    "Update User"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
