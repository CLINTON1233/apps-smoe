"use client";

import { useState, useEffect } from "react";
import { Search, Download, User, Filter, Plus, Edit, Trash2, RefreshCw, Eye, ChevronDown } from "lucide-react";
import { Poppins } from "next/font/google";
import Swal from "sweetalert2";
import LayoutDashboard from "../components/Layout/LayoutDashboard"; // Sesuaikan path sesuai struktur folder Anda

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// API base URL - sesuaikan dengan port backend Anda
const API_BASE_URL = 'http://localhost:5000';

export default function AdminManagementUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Fetch users dengan error handling yang lebih baik
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from:', `${API_BASE_URL}/users`);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

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
        text: error.message || "Failed to load users. Please check if the server is running.",
        confirmButtonColor: "#1e40af",
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

  // Handle add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setSubmitting(true);

    try {
      console.log('Adding new user:', formData);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('Add user response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User created successfully!",
          confirmButtonColor: "#1e40af",
        });
        setShowAddModal(false);
        resetForm();
        await fetchUsers(); // Refresh the list
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
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit user
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

      console.log('Updating user:', selectedUser.id, updateData);
      
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('Update user response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User updated successfully!",
          confirmButtonColor: "#1e40af",
        });
        setShowEditModal(false);
        resetForm();
        await fetchUsers(); // Refresh the list
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
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        console.log('Deleting user:', userId);
        
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "DELETE",
        });

        const data = await response.json();
        console.log('Delete user response:', data);

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User has been deleted.",
            confirmButtonColor: "#1e40af",
          });
          await fetchUsers(); // Refresh the list
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
      password: "", // Kosongkan password untuk edit
      badge: user.badge || "",
      telp: user.telp || "",
      departemen: user.departemen || "",
      role: user.role || "guest",
    });
    setShowEditModal(true);
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
        className={`flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition ${poppins.className}`}
      >
        Show {itemsPerPage === filteredUsers.length ? "All" : itemsPerPage}
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
                (option === "All" ? filteredUsers.length : option)
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

  // Mobile User Card Component
  const MobileUserCard = ({ user }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-semibold text-gray-900 truncate ${poppins.className}`}
              >
                {user.nama || "No Name"}
              </h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={() => openEditModal(user)}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-all"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteUser(user.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Badge</span>
            <span className="text-gray-900">{user.badge || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone</span>
            <span className="text-gray-900">{user.telp || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Department</span>
            <span className="text-gray-900">{user.departemen || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Role</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user.role === "admin"
                  ? "bg-purple-500 text-white"
                  : user.role === "superadmin"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Created: {new Date(user.created_at).toLocaleDateString("en-US")}
          </span>
          <span className="text-xs text-gray-500">ID: {user.id}</span>
        </div>
      </div>
    );
  };

  return (
    <LayoutDashboard>
      {/* Main Content */}
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all users and their roles in the system</p>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex-1 w-full">
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, badge, or department..."
                    className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 ${poppins.className}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700"
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  onClick={openAddModal}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Users Table/Cards */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {filteredUsers.length} of {users.length} Users
                </span>
                <ShowEntriesDropdown />
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading users...</span>
              </div>
            ) : !isMobile ? (
              /* Desktop Table */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Badge
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentData.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.nama || "No Name"}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.badge || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.telp || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.departemen || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-500 text-white"
                                : user.role === "superadmin"
                                ? "bg-red-500 text-white"
                                : "bg-blue-500 text-white"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
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
            {(totalPages > 1 || itemsPerPage !== 10) && filteredUsers.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ShowEntriesDropdown />
                    <p className="text-xs text-gray-700">
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
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              disabled={submitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New User</h2>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Badge Number
                </label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="telp"
                  value={formData.telp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="departemen"
                  value={formData.departemen}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                  disabled={submitting}
                >
                  <option value="admin">Admin</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    'Add User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              disabled={submitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit User</h2>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Badge Number
                </label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="telp"
                  value={formData.telp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="departemen"
                  value={formData.departemen}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                  disabled={submitting}
                >
                  <option value="admin">Admin</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutDashboard>
  );
}