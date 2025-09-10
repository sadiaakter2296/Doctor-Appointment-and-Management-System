import apiService from './apiService';

export const doctorService = {
  // Get all doctors
  getAllDoctors: () => {
    return apiService.get('/doctors');
  },

  // Get a single doctor by ID
  getDoctor: (id) => {
    return apiService.get(`/doctors/${id}`);
  },

  // Create a new doctor
  createDoctor: (doctorData) => {
    return apiService.post('/doctors', doctorData);
  },

  // Update an existing doctor
  updateDoctor: (id, doctorData) => {
    return apiService.put(`/doctors/${id}`, doctorData);
  },

  // Delete a doctor
  deleteDoctor: (id) => {
    return apiService.delete(`/doctors/${id}`);
  },

  // Search doctors
  searchDoctors: (params) => {
    return apiService.get('/doctors', { params });
  }
};

// Appointment Service
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

  // Get appointments by patient
  getByPatient: (patientEmail) => {
    return apiService.get(`/appointments/patient/${patientEmail}`);
  },

  // Update appointment status
  updateStatus: (id, status) => {
    return apiService.put(`/appointments/${id}/status`, { status });
  }
};

export default doctorService;
