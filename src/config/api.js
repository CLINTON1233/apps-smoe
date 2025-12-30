// config/api.js - Hapus upload icons
const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";
const PORTAL_API_URL =
  process.env.NEXT_PUBLIC_PORTAL_API_URL || "http://localhost:4000";
const SMOE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// URL untuk Portal (frontend)
export const PORTAL = {
  URL: PORTAL_URL,
  LOGIN_PAGE: `${PORTAL_URL}/login`,
  LOGIN_WITH_REDIRECT: (returnUrl) =>
    `${PORTAL_URL}/login?redirect=${encodeURIComponent(returnUrl)}`,
};

// API Endpoints untuk Portal
export const PORTAL_API = {
  BASE_URL: PORTAL_API_URL,
  VERIFY_TOKEN: `${PORTAL_API_URL}/users/verify-token`,
  USERS: `${PORTAL_API_URL}/users`,
  AUTH: `${PORTAL_API_URL}/auth`,
};

// API Endpoints untuk SMOE Apps
export const SMOE_API = {
  BASE_URL: SMOE_API_URL,
  LOGIN: `${SMOE_API_URL}/auth/login`,
  REGISTER: `${SMOE_API_URL}/users/register`,
  USERS: `${SMOE_API_URL}/users`,
  USER_BY_ID: (id) => `${SMOE_API_URL}/users/${id}`,
  CATEGORIES: `${SMOE_API_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${SMOE_API_URL}/categories/${id}`,
  APPLICATIONS: `${SMOE_API_URL}/applications`,
  APPLICATION_BY_ID: (id) => `${SMOE_API_URL}/applications/${id}`,
  APPLICATION_DOWNLOAD: (id) => `${SMOE_API_URL}/applications/${id}/download`,
  ICONS: `${SMOE_API_URL}/icons`,
  // HAPUS: ICONS_UPLOAD: `${SMOE_API_URL}/icons/upload`,
  UPLOADS: `${SMOE_API_URL}/uploads`,
};

// Export untuk backward compatibility
export const API_ENDPOINTS = {
  ...PORTAL_API,
  ...SMOE_API,
};

// Helper functions
export const getUploadUrl = (filename) => {
  return `${SMOE_API.UPLOADS}/${filename}`;
};

// Fungsi untuk icon URL (tetap dipertahankan untuk custom icons yang sudah ada)
export const getIconUrl = (filePath) => {
  if (!filePath) return null;
  
  // Jika sudah full URL, return langsung
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Jika file_path adalah path relatif, gabungkan dengan base URL
  if (filePath.startsWith('uploads/')) {
    return `${SMOE_API_URL}/${filePath}`;
  }
  
  // Untuk icon system (Lucide), return null
  return null;
};

export const getPortalLoginUrl = (returnUrl = null) => {
  if (returnUrl) {
    return `${PORTAL.LOGIN_WITH_REDIRECT(returnUrl)}`;
  }
  return PORTAL.LOGIN_PAGE;
};

export default {
  PORTAL,
  PORTAL_API,
  SMOE_API,
  API_ENDPOINTS,
  SMOE_API_URL,
  getUploadUrl,
  getIconUrl,
  getPortalLoginUrl,
};