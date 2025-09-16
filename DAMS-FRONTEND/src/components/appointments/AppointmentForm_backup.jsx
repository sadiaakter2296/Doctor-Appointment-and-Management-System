import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  FileText,
  AlertCircle,
  Save,
  X,
  Stethoscope,
  Activity,
  Phone,
  Mail,
  Heart,
  MapPin
} from 'lucide-react';

const AppointmentForm = ({ appointmentId, onClose, onAppointmentSaved }) => {
  const { appointments, addAppointment, updateAppointment } = useApp();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    status: 'pending'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch patients and doctors
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  // Listen for patient updates from other components
  useEffect(() => {
    const handlePatientUpdate = (event) => {
      console.log('Patient updated, refreshing patient list...', event.detail);
      fetchPatients(); // Refresh the patient list
    };

    window.addEventListener('patientUpdated', handlePatientUpdate);
    
    return () => {
      window.removeEventListener('patientUpdated', handlePatientUpdate);
    };
  }, []);

  // Refresh patient data when the form opens (for new appointments)
  useEffect(() => {
    if (!appointmentId) { // Only for new appointments
      fetchPatients();
    }
  }, [appointmentId]);
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  FileText,
  AlertCircle,
  Save,
  X,
  Stethoscope,
  Activity,
  Phone,
  Mail,
  Heart,
  MapPin
} from 'lucide-react';

const AppointmentForm = ({ appointmentId, onClose }) => {
  const { appointments, addAppointment, updateAppointment } = useApp();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    status: 'pending'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch patients and doctors
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  // Refresh patient data when the form opens (for new patients)
  useEffect(() => {
    if (!appointmentId) { // Only for new appointments
      fetchPatients();
    }
  }, [appointmentId]);

  useEffect(() => {
    if (appointmentId) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        setFormData({
          patient_id: appointment.patient_id || '',
          doctor_id: appointment.doctor_id,
          patient_name: appointment.patient_name,
          patient_email: appointment.patient_email,
          patient_phone: appointment.patient_phone,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          reason: appointment.reason || '',
          status: appointment.status
        });
        
        // Find and set selected patient for displaying full info
        if (appointment.patient_id) {
          const patient = patients.find(p => p.id === appointment.patient_id);
          setSelectedPatient(patient);
        }
      }
    }
  }, [appointmentId, appointments, patients]);

  const fetchPatients = async () => {
    try {
      console.log('Fetching patients from API...'); // Debug log
      const response = await fetch('http://127.0.0.1:8000/api/patients');
      console.log('Patient API response status:', response.status); // Debug log
      if (response.ok) {
        const result = await response.json();
        console.log('Patient API result:', result); // Debug log
        const patientsData = result.data || result;
        console.log('Setting patients:', patientsData); // Debug log
        setPatients(patientsData);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/doctors');
      if (response.ok) {
        const result = await response.json();
        setDoctors(result.data || result);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patient_id && !formData.patient_name) newErrors.patient = 'Patient is required';
    if (!formData.doctor_id) newErrors.doctor_id = 'Doctor is required';
    if (!formData.appointment_date) newErrors.appointment_date = 'Date is required';
    if (!formData.appointment_time) newErrors.appointment_time = 'Time is required';
    if (!formData.patient_email) newErrors.patient_email = 'Patient email is required';
    if (!formData.patient_phone) newErrors.patient_phone = 'Patient phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const appointmentData = {
        ...formData,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time + ':00' // Add seconds if needed
      };

      let response;
      if (appointmentId) {
        response = await fetch(`http://127.0.0.1:8000/api/appointments/${appointmentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData)
        });
      } else {
        response = await fetch('http://127.0.0.1:8000/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData)
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (appointmentId) {
          updateAppointment(appointmentId, result);
        } else {
          addAppointment(result);
        }
        
        // Notify parent component to refresh data
        if (onAppointmentSaved) {
          onAppointmentSaved(result);
        }
        
        onClose();
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || { general: 'Failed to save appointment' });
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      setErrors({ general: 'Failed to save appointment' });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Handle patient selection
    if (name === 'patient_id') {
      console.log('Patient selected, ID:', value); // Debug log
      const patient = patients.find(p => p.id === parseInt(value));
      console.log('Found patient:', patient); // Debug log
      if (patient) {
        setSelectedPatient(patient);
        setFormData(prev => ({
          ...prev,
          patient_name: patient.name,
          patient_email: patient.email,
          patient_phone: patient.phone
        }));
      } else {
        setSelectedPatient(null);
        setFormData(prev => ({
          ...prev,
          patient_name: '',
          patient_email: '',
          patient_phone: ''
        }));
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-blue-200/30">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
            {appointmentId ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h2>
          <p className="text-gray-600 mt-2">Fill in the details to schedule or update an appointment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="patient_id" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-blue-600" />
                Patient *
              </label>
              <button
                type="button"
                onClick={() => {
                  console.log('Refreshing patients...'); // Debug log
                  fetchPatients();
                }}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
              >
                Refresh Patients
              </button>
            </div>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30 ${
                errors.patient ? 'border-red-300' : 'border-blue-200/50'
              }`}
            >
              <option value="">Select a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.phone}
                </option>
              ))}
            </select>
            {errors.patient && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.patient}
              </div>
            )}
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <label htmlFor="doctor_id" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              Doctor *
            </label>
            <select
              id="doctor_id"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30 ${
                errors.doctor_id ? 'border-red-300' : 'border-blue-200/50'
              }`}
            >
              <option value="">Select a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
            {errors.doctor_id && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.doctor_id}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="appointment_date" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar className="w-4 h-4 text-green-600" />
              Date *
            </label>
            <input
              type="date"
              id="appointment_date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30 ${
                errors.appointment_date ? 'border-red-300' : 'border-blue-200/50'
              }`}
            />
            {errors.appointment_date && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.appointment_date}
              </div>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label htmlFor="appointment_time" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-purple-600" />
              Time *
            </label>
            <input
              type="time"
              id="appointment_time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30 ${
                errors.appointment_time ? 'border-red-300' : 'border-blue-200/50'
              }`}
            />
            {errors.appointment_time && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.appointment_time}
              </div>
            )}
          </div>
        </div>

        {/* Patient Details Section */}
        {selectedPatient && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Selected Patient Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Name:</span> {selectedPatient.name}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Email:</span> {selectedPatient.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Phone:</span> {selectedPatient.phone}
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Gender:</span> {selectedPatient.gender}
              </div>
              {selectedPatient.blood_type && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Blood Type:</span> {selectedPatient.blood_type}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">DOB:</span> {new Date(selectedPatient.date_of_birth).toLocaleDateString()}
              </div>
              {selectedPatient.address && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Address:</span> {selectedPatient.address}
                </div>
              )}
              {selectedPatient.emergency_contact && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Emergency:</span> {selectedPatient.emergency_contact}
                </div>
              )}
              {selectedPatient.medical_history && (
                <div className="md:col-span-3">
                  <span className="font-medium">Medical History:</span>
                  <p className="text-gray-600 mt-1">{selectedPatient.medical_history}</p>
                </div>
              )}
              {selectedPatient.allergies && (
                <div className="md:col-span-3">
                  <span className="font-medium text-red-600">Allergies:</span>
                  <p className="text-red-600 mt-1">{selectedPatient.allergies}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reason for Visit */}
        <div className="space-y-3">
          <label htmlFor="reason" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText className="w-4 h-4 text-orange-600" />
            Reason for Visit
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the reason for this appointment..."
            className="w-full px-4 py-3 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30 resize-none"
          />
        </div>

        {/* Patient Details Section */}
        {selectedPatient && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Selected Patient Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Name:</span> {selectedPatient.name}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Email:</span> {selectedPatient.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Phone:</span> {selectedPatient.phone}
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Gender:</span> {selectedPatient.gender}
              </div>
              {selectedPatient.blood_type && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Blood Type:</span> {selectedPatient.blood_type}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">DOB:</span> {new Date(selectedPatient.date_of_birth).toLocaleDateString()}
              </div>
              {selectedPatient.address && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Address:</span> {selectedPatient.address}
                </div>
              )}
              {selectedPatient.emergency_contact && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Emergency:</span> {selectedPatient.emergency_contact}
                </div>
              )}
              {selectedPatient.medical_history && (
                <div className="md:col-span-3">
                  <span className="font-medium">Medical History:</span>
                  <p className="text-gray-600 mt-1">{selectedPatient.medical_history}</p>
                </div>
              )}
              {selectedPatient.allergies && (
                <div className="md:col-span-3">
                  <span className="font-medium text-red-600">Allergies:</span>
                  <p className="text-red-600 mt-1">{selectedPatient.allergies}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reason for Visit */}
        <div className="space-y-3">
          <label htmlFor="reason" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText className="w-4 h-4 text-orange-600" />
            Reason for Visit
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the reason for this appointment..."
            className="w-full px-4 py-3 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30 resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-blue-100/50">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:shadow-lg hover:shadow-gray-200/50 hover:scale-105 transition-all duration-300 font-semibold"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-200/50 hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : (appointmentId ? 'Update Appointment' : 'Schedule Appointment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
