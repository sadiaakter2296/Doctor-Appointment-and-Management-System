const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('API Request:', url, config);
      const response = await fetch(url, config);
      
      // Handle network errors
      if (!response.ok) {
        // If it's a 500 error, provide a user-friendly message
        if (response.status === 500) {
          console.error('Server error (500):', await response.text());
          throw new Error('Server is experiencing issues. Please try again later.');
        }
        
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API Response:', response.status, data);
      return data;
      
    } catch (error) {
      console.error('API request failed:', error);
      
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Auth API methods
export const authAPI = {
  async login(credentials) {
    const api = new ApiService();
    return api.post('/login', credentials);
  },

  async register(userData) {
    const api = new ApiService();
    return api.post('/register', {
      ...userData,
      password_confirmation: userData.password // Laravel validation requirement
    });
  },

  async logout() {
    const api = new ApiService();
    return api.post('/logout');
  },

  async getUser() {
    const api = new ApiService();
    return api.get('/user');
  }
};

// Create and export an instance of ApiService
const apiServiceInstance = new ApiService();
export default apiServiceInstance;
