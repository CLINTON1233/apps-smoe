"use client";

import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          <span className="mt-4 text-sm text-gray-300">Loading...</span>
        </div>
      </div>
    );
  }

  // If no user (not logged in), redirect will be handled by AuthContext
  if (!user) {
    return null;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-2xl border border-gray-700 max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-400">
            Your role: <span className="text-blue-400 font-semibold">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return children;
}