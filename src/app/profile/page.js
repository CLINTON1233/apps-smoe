"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, X, Briefcase, Calendar } from "lucide-react";
import LayoutDashboard from "../components/Layout/LayoutDashboard";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:5000";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    id: "",
    nama: "",
    email: "",
    telp: "",
    departemen: "",
    role: "",
    badge: "",
    created_at: ""
  });

  const [tempData, setTempData] = useState({ ...userData });

  // Fetch user data from API
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const userId = 1; // Change this to dynamic user ID
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === "success") {
        setUserData(result.data);
        setTempData(result.data);
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
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    try {
      const userId = 1; // Change this to dynamic user ID
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
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
    fetchUserProfile();
  }, []);

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
      
      Swal.fire({
        title: "Success!",
        text: "Profile updated successfully",
        icon: "success",
        confirmButtonColor: "#1e40af",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to update profile: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#1e40af",
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
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get position based on role
  const getPositionFromRole = (role) => {
    const roleMap = {
      'admin': 'System Administrator',
      'superadmin': 'Super Administrator',
      'guest': 'Guest User',
      'user': 'Regular User'
    };
    return roleMap[role] || 'User';
  };

  if (isLoading) {
    return (
      <LayoutDashboard>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Profile Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your account information and preferences</p>
        </div>

        {/* Combined Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 text-center">{userData.nama || "No Name"}</h2>
                <p className="text-gray-600 text-center mt-1 text-xs sm:text-sm">{getPositionFromRole(userData.role)}</p>
                <span className="inline-block mt-1 sm:mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {userData.badge || "No Badge"}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <Mail className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Email</span>
                  </div>
                  <p className="text-gray-900 text-xs truncate">{userData.email}</p>
                </div>
                
                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <Briefcase className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Department</span>
                  </div>
                  <p className="text-gray-900 text-xs">{userData.departemen || "Not specified"}</p>
                </div>
                
                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Member Since</span>
                  </div>
                  <p className="text-gray-900 text-xs">{formatDate(userData.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                  >
                    <Edit className="w-3 h-3" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium disabled:opacity-50"
                    >
                      <Save className="w-3 h-3" />
                      {isLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-xs font-medium"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.nama || ""}
                        onChange={(e) => handleChange('nama', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium text-sm">{userData.nama || "Not specified"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <p className="text-gray-900 font-medium text-sm">{userData.email}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                {/* Phone & Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={tempData.telp || ""}
                          onChange={(e) => handleChange('telp', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-sm">{userData.telp || "Not specified"}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempData.departemen || ""}
                          onChange={(e) => handleChange('departemen', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                          placeholder="Enter department"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-sm">{userData.departemen || "Not specified"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Employee Badge
                    </label>
                    <p className="text-gray-900 font-medium text-sm">{userData.badge || "Not assigned"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        userData.role === 'admin' || userData.role === 'superadmin' 
                          ? 'bg-green-500' 
                          : 'bg-blue-500'
                      }`}></div>
                      <span className={`font-medium text-sm ${
                        userData.role === 'admin' || userData.role === 'superadmin' 
                          ? 'text-green-700' 
                          : 'text-blue-700'
                      }`}>
                        {userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1) || 'User'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Join Date & Account Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-gray-900 font-medium text-sm">{formatDate(userData.created_at)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        userData.role === 'admin' || userData.role === 'superadmin' 
                          ? 'bg-green-500' 
                          : 'bg-blue-500'
                      }`}></div>
                      <span className={`font-medium text-sm ${
                        userData.role === 'admin' || userData.role === 'superadmin' 
                          ? 'text-green-700' 
                          : 'text-blue-700'
                      }`}>
                        {getPositionFromRole(userData.role)}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        {userData.role === 'admin' || userData.role === 'superadmin' 
                          ? 'Full system access' 
                          : 'Limited access'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}