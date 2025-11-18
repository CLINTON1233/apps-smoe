"use client";

import { useState } from "react";
import { Search, Download, Plus, Edit, Trash2, Eye, RefreshCw, ChevronDown } from "lucide-react";
import LayoutDashboard from "../components/Layout/LayoutDashboard";

export default function AdminApplicationsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);

  // Sample data - replace with your actual data
  const apps = [
    {
      id: 1,
      title: "Tokopedia",
      fullName: "Tokopedia Online Shopping",
      url: "https://tokopedia.com",
      category: "Business",
      icon: "Globe",
      status: "Active",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Shopee",
      fullName: "Shopee E-commerce",
      url: "https://shopee.com",
      category: "Business",
      icon: "ShoppingCart",
      status: "Active",
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      title: "Gojek",
      fullName: "Gojek Super App",
      url: "https://gojek.com",
      category: "Productivity",
      icon: "Car",
      status: "Active",
      createdAt: "2024-02-01"
    },
    {
      id: 4,
      title: "Spotify",
      fullName: "Spotify Music Streaming",
      url: "https://spotify.com",
      category: "Entertainment",
      icon: "Music",
      status: "Active",
      createdAt: "2024-02-05"
    },
    {
      id: 5,
      title: "Zoom",
      fullName: "Zoom Video Conferencing",
      url: "https://zoom.us",
      category: "Productivity",
      icon: "Video",
      status: "Active",
      createdAt: "2024-02-10"
    },
    {
      id: 6,
      title: "Netflix",
      fullName: "Netflix Streaming Service",
      url: "https://netflix.com",
      category: "Entertainment",
      icon: "Film",
      status: "Active",
      createdAt: "2024-02-15"
    },
    {
      id: 7,
      title: "Duolingo",
      fullName: "Duolingo Language Learning",
      url: "https://duolingo.com",
      category: "Education",
      icon: "BookOpen",
      status: "Active",
      createdAt: "2024-02-20"
    },
    {
      id: 8,
      title: "WhatsApp",
      fullName: "WhatsApp Messenger",
      url: "https://whatsapp.com",
      category: "Utilities",
      icon: "MessageCircle",
      status: "Active",
      createdAt: "2024-02-25"
    }
  ];

  const entriesOptions = [10, 25, 50, 100, "All"];

  // Filter data
  const filteredApps = apps.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
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
                itemsPerPage === (option === "All" ? filteredApps.length : option)
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
              setSelectedApp(app);
              setShowEditModal(true);
            }}
            className="p-1 text-gray-400 hover:text-green-600 rounded transition-all"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-600 rounded transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Full Name:</span>
          <span className="text-gray-900 font-medium">{app.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Category:</span>
          <span className="text-gray-900 font-medium">{app.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            {app.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <LayoutDashboard>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Search and Controls */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full mx-auto mb-4">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg transition-all duration-300 placeholder-gray-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Application
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/30 mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Applications Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage all infrastructure applications</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredApps.length}</span> applications
                </p>
              </div>
            </div>
          </div>

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
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.map((app) => (
                  <tr key={app.id} className="hover:bg-blue-50/30 transition-all duration-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">A</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{app.title}</div>
                          <div className="text-xs text-gray-500">ID: {app.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-[200px] truncate">{app.fullName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{app.createdAt}</td>
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
                            setSelectedApp(app);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
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

          {/* Pagination */}
          {(totalPages > 1 || itemsPerPage !== 10) && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShowEntriesDropdown />
                  <p className="text-xs text-gray-700">
                    Showing{" "}
                    <span className="font-semibold">
                      {filteredApps.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                      {Math.min(currentPage * itemsPerPage, filteredApps.length)}
                    </span>{" "}
                    of <span className="font-semibold">{filteredApps.length}</span> applications
                  </p>
                </div>

                {totalPages > 1 && (
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
    </LayoutDashboard>
  );
}