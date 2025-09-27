const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
      console.log('Using auth token:', token.substring(0, 20) + '...');
    } else {
      console.log('No auth token found in localStorage');
    }

    try {
      console.log('API Request:', url, config.method || 'GET');
      console.log('Request headers:', config.headers);
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status, response.statusText);
      
      // Handle network errors
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
          console.log('Error response data:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Handle different error structures
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        // Check for error field first (our backend format)
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          if (typeof errorData.message === 'object') {
            // Validation errors object (Laravel style)
            const errors = Object.values(errorData.message).flat();
            errorMessage = errors.join(', ');
          } else {
            errorMessage = errorData.message;
          }
        }
        
        // Handle authentication errors
        if (response.status === 401) {
          console.error('Authentication failed - clearing invalid token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          // Don't redirect here to avoid infinite loops, let the component handle it
        }
        
        // If it's a 500 error, provide a user-friendly message
        if (response.status === 500) {
          console.error('Server error (500):', errorData);
          errorMessage = 'Server is experiencing issues. Please try again later.';
        }
        
        // Create a custom error with response data
        const customError = new Error(errorMessage);
        customError.response = {
          status: response.status,
          data: errorData
        };
        
        throw customError;
      }

      const data = await response.json();
      console.log('API Response:', response.status, data);
      return data;
      
    } catch (error) {
      console.error('API request failed:', error);
      
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error details:', error);
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
