import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    // Preserve the original error
    return Promise.reject(error);
  }
);

const apiService = {
  // Get all items
  getInventory: async () => {
    try {
      const response = await api.get('/items');
      return response.items || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  // Get all containers
  getContainers: async () => {
    try {
      const response = await api.get('/containers');
      return response.containers || [];
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw error;
    }
  },

  // Place item in container
  placeItem: async (data) => {
    try {
      const response = await api.post(`/items/place?item_id=${data.item_id}&container_id=${data.container_id}`);
      return response;
    } catch (error) {
      console.error('Error placing item:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to place item');
    }
  },

  // Retrieve item from container
  retrieveItem: async (itemId) => {
    try {
      const response = await api.post(`/items/retrieve?item_id=${itemId}`);
      return response;
    } catch (error) {
      console.error('Error retrieving item:', error);
      throw new Error(error.response?.data?.detail || 'Failed to retrieve item. Please check if the item exists and is placed.');
    }
  },

  // Get waste items
  getWasteItems: async () => {
    try {
      const response = await api.get('/items/waste');
      return response.waste_items || [];
    } catch (error) {
      console.error('Error fetching waste items:', error);
      throw new Error(error.message || 'Failed to fetch waste items');
    }
  },

  // Mark item as waste
  markAsWaste: async (itemId) => {
    try {
      const response = await api.post(`/items/waste/${itemId}`);
      return response;
    } catch (error) {
      console.error('Error marking item as waste:', error);
      throw new Error(error.response?.data?.detail || 'Failed to mark item as waste.');
    }
  },

  // Get system logs
  getLogs: async () => {
    try {
      const response = await api.get('/logs');
      return response.logs || [];
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  },

  // Get current date
  getCurrentDate: async () => {
    try {
      const response = await api.get('/current-date');
      return response.current_date;
    } catch (error) {
      console.error('Error fetching current date:', error);
      throw error;
    }
  },

  // Fast forward time
  fastForward: async (days) => {
    try {
      console.log('Sending fast-forward request with days:', days);
      const response = await api.post('/fast-forward', { days: Number(days) });
      console.log('Fast-forward response:', response);
      return response;
    } catch (error) {
      console.error('Error fast forwarding time:', error);
      console.error('Error response:', error.response);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fast forward time. Please try again.');
    }
  },

  // Set specific date
  setDate: async (date) => {
    try {
      const response = await api.post('/set-date', { date });
      return response;
    } catch (error) {
      console.error('Error setting date:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to set date. Please try again.');
    }
  }
};

export default apiService;