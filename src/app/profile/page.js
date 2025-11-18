"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import LayoutDashboard from "../components/Layout/LayoutDashboard";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Admin User",
    email: "admin@seatrium.com",
    phone: "+62 812-3456-7890",
    department: "IT Department",
    position: "System Administrator",
    location: "Singapore Office",
    badge: "ST-2024-001",
    joinDate: "January 15, 2023"
  });

  const [tempData, setTempData] = useState({ ...userData });

  const handleEdit = () => {
    setTempData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setUserData({ ...tempData });
    setIsEditing(false);
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

  return (
    <LayoutDashboard>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 text-center">{userData.name}</h2>
                <p className="text-gray-600 text-center mt-1">{userData.position}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {userData.badge}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-gray-600 text-sm">Applications</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">156</p>
                  <p className="text-gray-600 text-sm">Total Downloads</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">2.3K</p>
                  <p className="text-gray-600 text-sm">Active Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{userData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={tempData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{userData.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={tempData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{userData.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{userData.department}</p>
                    )}
                  </div>
                </div>

                {/* Position & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{userData.position}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{userData.location}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge & Join Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Badge
                    </label>
                    <p className="text-gray-900 font-medium">{userData.badge}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Join Date
                    </label>
                    <p className="text-gray-900 font-medium">{userData.joinDate}</p>
                  </div>
                </div>

                {/* Account Type */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">Administrator</span>
                    <span className="text-gray-500 text-sm ml-2">Full system access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Security</h3>
              <div className="space-y-4">
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Change Password</p>
                      <p className="text-sm text-gray-600">Update your password regularly</p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Login Activity</p>
                      <p className="text-sm text-gray-600">View recent login attempts</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}