// API client for Dropout backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: getHeaders(),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

// ---- Drops ----
export async function fetchDrops(category) {
  const params = category && category !== 'all' ? `?category=${category}` : '';
  return apiFetch(`/api/drops${params}`);
}

export async function fetchDrop(id) {
  return apiFetch(`/api/drops/${id}`);
}

export async function fetchTrending() {
  return apiFetch('/api/drops/trending');
}

export async function likeDrop(id) {
  return apiFetch(`/api/drops/${id}/like`, { method: 'PUT' });
}

export async function unlikeDrop(id) {
  return apiFetch(`/api/drops/${id}/unlike`, { method: 'PUT' });
}

export async function addComment(dropId, text, userId) {
  return apiFetch(`/api/drops/${dropId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text, userId }),
  });
}

export async function viewDrop(id) {
  return apiFetch(`/api/drops/${id}/view`, { method: 'PUT' });
}

// ---- Brands ----
export async function fetchBrands() {
  return apiFetch('/api/brands');
}

// ---- Auth ----
export async function login(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(email, name, password, role = 'user') {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, name, password, role }),
  });
}

export async function fetchMe() {
  return apiFetch('/api/auth/me');
}

// ---- Users ----
export async function toggleSave(userId, dropId) {
  return apiFetch(`/api/users/${userId}/save/${dropId}`, { method: 'PUT' });
}

export async function fetchSavedDrops(userId) {
  return apiFetch(`/api/users/${userId}/saved`);
}

export async function fetchUserProfile(userId) {
  return apiFetch(`/api/users/${userId}`);
}

export async function updateProfile(userId, data) {
  return apiFetch(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ---- Upload ----
export async function uploadImage(file, options = {}) {
  const formData = new FormData();
  formData.append('image', file);
  if (options.folder) formData.append('folder', options.folder);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

// ---- Helpers ----
// Transform backend drop format to match frontend expectations
export function transformDrop(d) {
  return {
    id: d.id,
    title: d.title,
    brand: d.brand || { name: 'Unknown', logo: '' },
    category: d.category,
    description: d.description,
    imageUrl: d.imageUrl,
    dropTime: d.dropTime,
    price: d.price,
    hypeScore: d.hypeScore,
    engagement: {
      likes: d.likes || 0,
      comments: d._count?.comments || 0,
      saves: d._count?.saves || 0,
      views: d.views || 0,
    },
    featured: d.featured,
    website: d.website,
  };
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
