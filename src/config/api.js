// config/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,

  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,

  // Applications
  APPLICATIONS: `${API_BASE_URL}/applications`,
  APPLICATION_BY_ID: (id) => `${API_BASE_URL}/applications/${id}`,
  APPLICATION_DOWNLOAD: (id) => `${API_BASE_URL}/applications/${id}/download`,

  // Icons
  ICONS: `${API_BASE_URL}/icons`,

  // Uploads
  UPLOADS: `${API_BASE_URL}/uploads`,
};

// Helper function untuk build upload URL
export const getUploadUrl = (filename) => {
  return `${API_ENDPOINTS.UPLOADS}/${filename}`;
};

// Helper function untuk build icon URL (untuk custom icons)
export const getIconUrl = (filePath) => {
  if (!filePath) return null;
  return `${API_BASE_URL}/${filePath}`;
};

export default API_BASE_URL;
