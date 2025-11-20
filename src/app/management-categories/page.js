"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  RefreshCw,
  ChevronDown,
  Tag,
  FileText,
} from "lucide-react";
import LayoutDashboard from "../components/Layout/LayoutDashboard";
import Swal from "sweetalert2";
import Image from "next/image";

const API_BASE_URL = "http://localhost:5000";

export default function AdminCategoriesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const [editCategory, setEditCategory] = useState({
    id: null,
    name: "",
    description: "",
  });

  const entriesOptions = [10, 25, 50, 100, "All"];

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Categories Response:", result);
      if (result.status === "success") {
        setCategories(result.data || []);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter data
  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentData = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (value) => {
    if (value === "All") {
      setItemsPerPage(filteredCategories.length);
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
        Show {itemsPerPage === filteredCategories.length ? "All" : itemsPerPage}
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
                (option === "All" ? filteredCategories.length : option)
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

  // Handle Create Category
  const handleCreateCategory = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!newCategory.name) {
        Swal.fire({
          title: "Validation Error",
          text: "Category name is required",
          icon: "warning",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === "success") {
        setShowAddModal(false);
        setNewCategory({
          name: "",
          description: "",
        });
        await fetchCategories();

        Swal.fire({
          title: "Success!",
          text: "Category created successfully",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to create category",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Category
  const handleUpdateCategory = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!editCategory.name) {
        Swal.fire({
          title: "Validation Error",
          text: "Category name is required",
          icon: "warning",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/categories/${editCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editCategory.name,
            description: editCategory.description,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === "success") {
        setShowEditModal(false);
        await fetchCategories();

        Swal.fire({
          title: "Success!",
          text: "Category updated successfully",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to update category",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (category) => {
    const result = await Swal.fire({
      title: `Delete ${category.name}?`,
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
        const response = await fetch(
          `${API_BASE_URL}/categories/${category.id}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (result.status === "success") {
          fetchCategories();
          Swal.fire({
            title: "Deleted!",
            text: `${category.name} has been deleted.`,
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
          text: error.message || "Failed to delete category.",
          icon: "error",
          confirmButtonColor: "#3b82f6",
          background: "#1f2937",
          color: "#f9fafb",
        });
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Mobile Card View
  const MobileCategoryCard = ({ category }) => (
    <div className="bg-gray-800 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/50 rounded-lg">
            <Tag className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{category.name}</h3>
            <p className="text-xs text-gray-400">ID: {category.id}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {
              setSelectedCategory(category);
              setShowDetailModal(true);
            }}
            className="p-1 text-gray-400 hover:text-blue-400 rounded transition-all"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              setEditCategory({
                id: category.id,
                name: category.name,
                description: category.description || "",
              });
              setShowEditModal(true);
            }}
            className="p-1 text-gray-400 hover:text-green-400 rounded transition-all"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleDeleteCategory(category)}
            className="p-1 text-gray-400 hover:text-red-400 rounded transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Description:</span>
          <span className="text-white font-medium text-right flex-1 ml-2">
            {category.description || "No description"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Created:</span>
          <span className="text-white font-medium">
            {formatDate(category.created_at)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Updated:</span>
          <span className="text-white font-medium">
            {formatDate(category.updated_at)}
          </span>
        </div>
      </div>
    </div>
  );

  // Detail Modal Component
  const CategoryDetailModal = ({ category, onClose }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl animate-fade-in relative mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Category Details</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-900/50 rounded-lg">
              <Tag className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{category.name}</h3>
              <p className="text-sm text-gray-400">ID: {category.id}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <p className="text-white bg-gray-700/50 rounded-lg p-3 min-h-[60px]">
              {category.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Created Date
              </label>
              <p className="text-white">{formatDate(category.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Last Updated
              </label>
              <p className="text-white">{formatDate(category.updated_at)}</p>
            </div>
          </div>
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
              Categories Management
            </h1>
            <p className="text-gray-400 mt-2">
              Manage application categories for better organization
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
                      placeholder="Search categories by name or description..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-white bg-gray-700 placeholder-gray-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={fetchCategories}
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
                    Add Category
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
                    {filteredCategories.length} of {categories.length}{" "}
                    Categories
                  </span>
                  <ShowEntriesDropdown />
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">
                    Loading categories...
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
                            Category
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Created Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {currentData.map((category) => (
                          <tr
                            key={category.id}
                            className="hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-900/50 rounded-lg">
                                  <Tag className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    {category.name}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    ID: {category.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-white max-w-[300px]">
                              <p className="truncate">
                                {category.description || "No description"}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-white">
                              {formatDate(category.created_at)}
                            </td>
                            <td className="px-4 py-3 text-sm text-white">
                              {formatDate(category.updated_at)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded transition-all"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditCategory({
                                      id: category.id,
                                      name: category.name,
                                      description: category.description || "",
                                    });
                                    setShowEditModal(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-900/30 rounded transition-all"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded transition-all"
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
                    {currentData.map((category) => (
                      <MobileCategoryCard
                        key={category.id}
                        category={category}
                      />
                    ))}
                  </div>

                  {/* No Data State */}
                  {filteredCategories.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-gray-500">
                      <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No categories found</p>
                      <p className="text-sm mt-1">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : "Get started by adding a new category"}
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {(totalPages > 1 || itemsPerPage !== 10) &&
                    filteredCategories.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-700 bg-gray-900">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <ShowEntriesDropdown />
                            <p className="text-xs text-gray-300">
                              Showing{" "}
                              <span className="font-semibold">
                                {filteredCategories.length === 0
                                  ? 0
                                  : (currentPage - 1) * itemsPerPage + 1}
                                -
                                {Math.min(
                                  currentPage * itemsPerPage,
                                  filteredCategories.length
                                )}
                              </span>{" "}
                              of{" "}
                              <span className="font-semibold">
                                {filteredCategories.length}
                              </span>{" "}
                              categories
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
        {showDetailModal && selectedCategory && (
          <CategoryDetailModal
            category={selectedCategory}
            onClose={() => setShowDetailModal(false)}
          />
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
            <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-2xl animate-fade-in relative mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-100 mb-6">
                Add New Category
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                    placeholder="Enter category name"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-500"
                    placeholder="Enter category description (optional)"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={isSubmitting || !newCategory.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
            <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-2xl animate-fade-in relative mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-100 mb-6">
                Edit Category: {editCategory.name}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={editCategory.name}
                    onChange={(e) =>
                      setEditCategory({ ...editCategory, name: e.target.value })
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
                    value={editCategory.description}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={isSubmitting || !editCategory.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Category"
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
          <p>IT Applications Dashboard</p>
          <p className="mt-1">seatrium.com</p>
        </div>
      </footer>
    </LayoutDashboard>
  );
}
