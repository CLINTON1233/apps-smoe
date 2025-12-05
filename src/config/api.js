// config/api.js
const PORTAL_API_URL = process.env.NEXT_PUBLIC_PORTAL_API_URL || "http://localhost:4000";
const SMOE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // ENDPOINT UNTUK VERIFIKASI TOKEN PORTAL
  VERIFY_TOKEN: `${PORTAL_API_URL}/users/verify-token`,
  
  // Auth SMOE Apps 
  LOGIN: `${SMOE_API_URL}/auth/login`,
  REGISTER: `${SMOE_API_URL}/users/register`,

  // Users
  USERS: `${SMOE_API_URL}/users`,
  USER_BY_ID: (id) => `${SMOE_API_URL}/users/${id}`,

  // Categories
  CATEGORIES: `${SMOE_API_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${SMOE_API_URL}/categories/${id}`,

  // Applications
  APPLICATIONS: `${SMOE_API_URL}/applications`,
  APPLICATION_BY_ID: (id) => `${SMOE_API_URL}/applications/${id}`,
  APPLICATION_DOWNLOAD: (id) => `${SMOE_API_URL}/applications/${id}/download`,

  // Icons
  ICONS: `${SMOE_API_URL}/icons`,

  // Uploads
  UPLOADS: `${SMOE_API_URL}/uploads`,
};

// Helper function untuk build upload URL
export const getUploadUrl = (filename) => {
  return `${API_ENDPOINTS.UPLOADS}/${filename}`;
};

// Helper function untuk build icon URL (untuk custom icons)
export const getIconUrl = (filePath) => {
  if (!filePath) return null;
  return `${SMOE_API_URL}/${filePath}`;
};

export default SMOE_API_URL;