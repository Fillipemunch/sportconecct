import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
};

// User API
export const userAPI = {
  updateProfile: async (updateData) => {
    const response = await api.put('/users/profile', updateData);
    localStorage.setItem('currentUser', JSON.stringify(response.data));
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

// Sports API
export const sportsAPI = {
  getAll: async () => {
    const response = await api.get('/sports');
    return response.data;
  }
};

// Events API
export const eventsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  join: async (id) => {
    const response = await api.post(`/events/${id}/join`);
    return response.data;
  },

  leave: async (id) => {
    const response = await api.post(`/events/${id}/leave`);
    return response.data;
  },

  getMessages: async (id) => {
    const response = await api.get(`/events/${id}/messages`);
    return response.data;
  },

  sendMessage: async (id, messageData) => {
    const response = await api.post(`/events/${id}/messages`, messageData);
    return response.data;
  }
};

// Friends API
export const friendsAPI = {
  getAll: async () => {
    const response = await api.get('/friends');
    return response.data;
  },

  getSuggestions: async (limit = 10, search = '') => {
    const params = { limit };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const response = await api.get('/friends/suggestions', { params });
    return response.data;
  },

  add: async (userId) => {
    const response = await api.post(`/friends/${userId}`);
    return response.data;
  },

  remove: async (userId) => {
    const response = await api.delete(`/friends/${userId}`);
    return response.data;
  }
};

export default api;