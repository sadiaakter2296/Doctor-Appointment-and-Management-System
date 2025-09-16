import apiService from './apiService';

export const appointmentService = {
  // Get all appointments
  getAll: () => {
    return apiService.get('/appointments');
  },

  // Get a single appointment by ID
  getById: (id) => {
    return apiService.get(`/appointments/${id}`);
  },

  // Create a new appointment
  create: (appointmentData) => {
    return apiService.post('/appointments', appointmentData);
  },

  // Update an existing appointment
  update: (id, appointmentData) => {
    return apiService.put(`/appointments/${id}`, appointmentData);
  },

  // Delete an appointment
  delete: (id) => {
    return apiService.delete(`/appointments/${id}`);
  },

  // Get appointments by doctor
  getByDoctor: (doctorId) => {
    return apiService.get(`/appointments/doctor/${doctorId}`);
  },

  // Get appointments by patient email
  getByPatient: (patientEmail) => {
    return apiService.get(`/appointments/patient/${patientEmail}`);
  },

  // Update appointment status
  updateStatus: (id, status) => {
    return apiService.put(`/appointments/${id}/status`, { status });
  },

  // Search appointments
  search: (params) => {
    return apiService.get('/appointments', { params });
  }
};

export default appointmentService;