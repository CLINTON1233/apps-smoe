"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Briefcase,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import LayoutDashboard from "../componentsSuperAdmin/Layout/LayoutDashboard";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import API_BASE_URL, { API_ENDPOINTS } from "../../../config/api";

export default function AdminProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [userData, setUserData] = useState({
    id: "",
    nama: "",
    email: "",
    telp: "",
    departemen: "",
    role: "",
    badge: "",
    created_at: "",
  });

  const [tempData, setTempData] = useState({ ...userData });

  // Get current user from localStorage
  const getCurrentUser = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  // Fetch user data from API based on logged in user
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);

      const currentUser = getCurrentUser();

      if (!currentUser || !currentUser.id) {
        Swal.fire({
          title: "Error",
          text: "User not found. Please login again.",
          icon: "error",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#f9fafb",
        }).then(() => {
          router.push("/login");
        });
        return;
      }

      const userId = currentUser.id;

      const response = await fetch(API_ENDPOINTS.USER_BY_ID(userId));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setUserData(result.data);
        setTempData(result.data);

        // Update localStorage dengan data terbaru
        localStorage.setItem("user", JSON.stringify(result.data));
      } else {
        throw new Error(result.message || "Failed to load user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to load profile: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    try {
      const currentUser = getCurrentUser();

      if (!currentUser || !currentUser.id) {
        throw new Error("User not found");
      }

      const userId = currentUser.id;

      const response = await fetch(API_ENDPOINTS.USER_BY_ID(userId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === "success") {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    fetchUserProfile();
  }, [router]);

  const handleEdit = () => {
    setTempData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const updateData = {
        nama: tempData.nama,
        telp: tempData.telp,
        departemen: tempData.departemen,
      };

      const updatedUser = await updateUserProfile(updateData);

      setUserData(updatedUser);
      setIsEditing(false);

      // Update localStorage dengan data terbaru
      localStorage.setItem("user", JSON.stringify(updatedUser));

      Swal.fire({
        title: "Success!",
        text: "Profile updated successfully",
        icon: "success",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to update profile: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData({ ...userData });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get position based on role
  const getPositionFromRole = (role) => {
    const roleMap = {
      admin: "System Administrator",
      superadmin: "Super Administrator",
      guest: "Guest User",
      user: "Regular User",
    };
    return roleMap[role] || "User";
  };

  const handleLogout = () => {
    // Clear localStorage and redirect to login
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    router.push("/login");
  };

  if (isLoading) {
    return (
      <LayoutDashboard>
        <div className="min-h-screen bg-gray-900">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400 text-sm">
                Loading profile...
              </span>
            </div>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <LayoutDashboard>
        {/* DARK MODE: Added dark background */}
        <div className="min-h-screen bg-gray-900 text-gray-100 relative">
          {/* Background Logo Transparan */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                src="/seatrium_logo_white.png"
                alt="Seatrium Background Logo"
                fill
                className="object-contain opacity-3 scale-75" // Opacity 3% untuk efek transparan yang lebih halus
                priority
              />
            </div>
          </div>

          {/* Background Gradient Overlay */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/50 via-blue-500/30 to-gray-700/40" />
          </div>

          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative z-10">
            {/* Profile Header - DARK MODE */}
            <div className="mb-6 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-400 text-sm">
                Manage your account information and preferences
              </p>
            </div>

            {/* Profile Form Container */}
            <div className="max-w-2xl mx-auto">
              {/* Profile Icon */}
              <div className="flex flex-col items-center mb-6 text-white">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold">
                  {userData.nama || "No Name"}
                </h2>
                <p className="text-gray-400 text-xs">
                  {getPositionFromRole(userData.role)}
                </p>
                <span className="inline-block mt-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-400/30">
                  {userData.badge || "No Badge"}
                </span>
              </div>

              {/* Profile Form */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 shadow-xl">
                <div className="space-y-4">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Full Name *
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempData.nama || ""}
                          onChange={(e) => handleChange("nama", e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 text-sm"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-white font-medium text-sm px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50">
                          {userData.nama || "Not specified"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <p className="text-white font-medium text-sm">
                          {userData.email}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  {/* Phone & Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="tel"
                            value={tempData.telp || ""}
                            onChange={(e) =>
                              handleChange("telp", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 text-sm"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <p className="text-white font-medium text-sm px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50 w-full">
                            {userData.telp || "Not specified"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Department
                      </label>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempData.departemen || ""}
                            onChange={(e) =>
                              handleChange("departemen", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 text-sm"
                            placeholder="Enter department"
                          />
                        ) : (
                          <p className="text-white font-medium text-sm px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50 w-full">
                            {userData.departemen || "Not specified"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge & Role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Employee Badge
                      </label>
                      <p className="text-white font-medium text-sm px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        {userData.badge || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Role
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            userData.role === "admin" ||
                            userData.role === "superadmin"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <span
                          className={`font-medium text-sm ${
                            userData.role === "admin" ||
                            userData.role === "superadmin"
                              ? "text-green-400"
                              : "text-blue-400"
                          }`}
                        >
                          {userData.role?.charAt(0).toUpperCase() +
                            userData.role?.slice(1) || "User"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Member Since
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-white font-medium text-sm">
                          {formatDate(userData.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end pt-3">
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        <Edit className="w-3 h-3" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
                        >
                          <Save className="w-3 h-3" />
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 py-6 text-center text-gray-400 text-sm border-t border-gray-700/50 relative z-10">
            <div className="max-w-6xl mx-auto px-4">
              <p>IT Infrastructure Dashboard</p>
              <p className="mt-1">seatrium.com</p>
            </div>
          </footer>

          {/* Logout Modal */}
          {showLogoutModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
              <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 sm:p-8 w-full sm:max-w-md shadow-xl animate-fade-in relative text-center border border-gray-600/50">
                <div className="flex justify-center mb-3">
                  <AlertTriangle className="w-12 h-12 text-yellow-500" />
                </div>

                <h2 className="text-lg font-medium mb-2 text-white">
                  Logout Confirmation
                </h2>

                <p className="text-gray-300 mb-4 text-sm">
                  Are you sure you want to logout from your account?
                </p>

                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Yes, Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </LayoutDashboard>
    </ProtectedRoute>
  );
}
