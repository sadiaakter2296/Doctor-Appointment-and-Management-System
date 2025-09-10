import apiService from './apiService';

export const patientService = {
  // Get all patients
  getAll: async () => {
    try {
      const response = await apiService.get('/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get patient by ID
  getById: async (id) => {
    try {
      const response = await apiService.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  // Create new patient
  create: async (patientData) => {
    try {
      const response = await apiService.post('/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Update patient
  update: async (id, patientData) => {
    try {
      const response = await apiService.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  // Delete patient
  delete: async (id) => {
    try {
      const response = await apiService.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  // Search patients
  search: async (query) => {
    try {
      const response = await apiService.get(`/patients/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }
};

export default patientService;
