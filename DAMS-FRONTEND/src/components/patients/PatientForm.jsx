import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Heart, AlertTriangle, Shield, Save, X, Stethoscope, Clock } from 'lucide-react';
import { patientService } from '../../api/patientService';
import { doctorService } from '../../api/doctorService';

const PatientForm = ({ isOpen, onClose, onPatientAdded, patient = null }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    date_of_birth: patient?.date_of_birth || '',
    gender: patient?.gender || '',
    blood_type: patient?.blood_type || '',
    address: patient?.address || '',
    emergency_contact: patient?.emergency_contact || '',
    emergency_contact_name: patient?.emergency_contact_name || '',
    status: patient?.status || 'Active',
    medical_history: patient?.medical_history || '',
    allergies: patient?.allergies || '',
    insurance_provider: patient?.insurance_provider || '',
    insurance_policy_number: patient?.insurance_policy_number || '',
    doctor_id: patient?.doctor_id || '',
    booking_reason: patient?.booking_reason || '',
    preferred_appointment_date: patient?.preferred_appointment_date || '',
    appointment_status: patient?.appointment_status || 'Pending'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const statuses = ['Active', 'Inactive'];
  const appointmentStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  // Update form data when patient prop changes
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || '',
        blood_type: patient.blood_type || '',
        address: patient.address || '',
        emergency_contact: patient.emergency_contact || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        status: patient.status || 'Active',
        medical_history: patient.medical_history || '',
        allergies: patient.allergies || '',
        insurance_provider: patient.insurance_provider || '',
        insurance_policy_number: patient.insurance_policy_number || '',
        doctor_id: patient.doctor_id || '',
        booking_reason: patient.booking_reason || '',
        preferred_appointment_date: patient.preferred_appointment_date || '',
        appointment_status: patient.appointment_status || 'Pending'
      });
    } else {
      // Reset form for new patient
      setFormData({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        blood_type: '',
        address: '',
        emergency_contact: '',
        emergency_contact_name: '',
        status: 'Active',
        medical_history: '',
        allergies: '',
        insurance_provider: '',
        insurance_policy_number: '',
        doctor_id: '',
        booking_reason: '',
        preferred_appointment_date: '',
        appointment_status: 'Pending'
      });
    }
    // Clear any previous errors and success state
    setErrors({});
    setSuccess(false);
  }, [patient]);

  // Load doctors when component mounts
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const { doctorService } = await import('../../api/doctorService');
        const response = await doctorService.getAllDoctors();
        setDoctors(response.data || []);
      } catch (error) {
        console.error('Error loading doctors:', error);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    if (isOpen) {
      loadDoctors();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergency_contact.trim()) newErrors.emergency_contact = 'Emergency contact is required';
    
    // Doctor booking validation (if doctor is selected)
    if (formData.doctor_id) {
      if (!formData.preferred_appointment_date) {
        newErrors.preferred_appointment_date = 'Preferred appointment date is required when booking a doctor';
      }
      if (!formData.booking_reason.trim()) {
        newErrors.booking_reason = 'Reason for visit is required when booking a doctor';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Import services dynamically to avoid circular dependency
      const { patientService } = await import('../../api/patientService');
      const { appointmentService } = await import('../../api/appointmentService');
      
      let patientResponse;
      if (patient) {
        patientResponse = await patientService.update(patient.id, formData);
      } else {
        patientResponse = await patientService.create(formData);
      }

      // If a doctor is selected, create an appointment
      if (formData.doctor_id && formData.preferred_appointment_date) {
        const appointmentData = {
          doctor_id: formData.doctor_id,
          patient_id: patientResponse.data?.id || patientResponse.id,
          patient_name: formData.name,
          patient_email: formData.email,
          patient_phone: formData.phone,
          appointment_date: formData.preferred_appointment_date.split('T')[0],
          appointment_time: formData.preferred_appointment_date.split('T')[1] || '09:00',
          reason: formData.booking_reason,
          status: formData.appointment_status || 'pending'
        };

        try {
          const appointmentResponse = await appointmentService.create(appointmentData);
          console.log('✅ Appointment created successfully:', appointmentResponse);
          
          // Dispatch appointment created event to notify other components
          window.dispatchEvent(new CustomEvent('appointmentCreated', { 
            detail: { appointment: appointmentResponse.data || appointmentResponse } 
          }));
          console.log('📡 PatientForm: appointmentCreated event dispatched');
          
        } catch (appointmentError) {
          console.error('Error creating appointment:', appointmentError);
          // Don't fail the entire process if appointment creation fails
        }
      }

      setSuccess(true);
      
      // Notify other components that a patient was added/updated
      console.log('📡 PatientForm: Dispatching patientUpdated event with data:', patientResponse.data || patientResponse);
      window.dispatchEvent(new CustomEvent('patientUpdated', { 
        detail: { patient: patientResponse.data || patientResponse } 
      }));
      console.log('✅ PatientForm: patientUpdated event dispatched successfully');
      
      // Call parent callback to refresh patient list
      if (onPatientAdded) {
        onPatientAdded(patientResponse.data || patientResponse);
      }

      // Auto close after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
        if (!patient) {
          // Reset form for new patient
          setFormData({
            name: '', email: '', phone: '', date_of_birth: '', gender: '',
            blood_type: '', address: '', emergency_contact: '', emergency_contact_name: '',
            status: 'Active', medical_history: '', allergies: '', insurance_provider: '',
            insurance_policy_number: '', doctor_id: '', booking_reason: '', 
            preferred_appointment_date: '', appointment_status: 'Pending'
          });
        }
      }, 1500);

    } catch (error) {
      console.error('Error saving patient:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ 
          general: error.response?.data?.message || 'Failed to save patient. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-blue-500" />
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
            <Save className="h-5 w-5" />
            Patient {patient ? 'updated' : 'created'} successfully!
            {formData.doctor_id && formData.preferred_appointment_date && (
              <span className="ml-2">✅ Appointment also scheduled!</span>
            )}
          </div>
        )}

        {errors.general && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="patient@gmail.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                    placeholder="+088"
                  />
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date_of_birth ? 'border-red-500' : ''
                    }`}
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.gender ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select Gender</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type
                </label>
                <div className="relative">
                  <select
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <Heart className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <div className="relative">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter complete address"
                />
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Number *
                </label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.emergency_contact ? 'border-red-500' : ''
                  }`}
                  placeholder="+088"
                />
                {errors.emergency_contact && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact}</p>}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-500" />
              Medical Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Previous medical conditions, surgeries, treatments..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Drug allergies, food allergies, environmental allergies..."
                />
              </div>
            </div>
          </div>

          {/* Doctor Booking */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              Book Appointment with Doctor
            </h3>
            
            {/* Doctor Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor *
              </label>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={loadingDoctors}
              >
                <option value="">
                  {loadingDoctors ? 'Loading doctors...' : 'Choose a doctor to see their schedule'}
                </option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Information & Schedule */}
            {formData.doctor_id && (
              <div className="bg-white rounded-lg border shadow-sm mb-6">
                {(() => {
                  const selectedDoctor = doctors.find(d => d.id.toString() === formData.doctor_id);
                  if (!selectedDoctor) return null;
                  
                  return (
                    <div className="p-6">
                      {/* Doctor Information */}
                      <div className="border-b border-gray-200 pb-4 mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Doctor Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Name:</span> Dr. {selectedDoctor.name}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Specialty:</span> {selectedDoctor.specialization || selectedDoctor.specialty}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Experience:</span> {selectedDoctor.experience} years
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Consultation Fee:</span> ${selectedDoctor.fee}
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Location:</span> {selectedDoctor.location}
                          </div>
                        </div>
                      </div>

                      {/* Doctor's Schedule */}
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Doctor's Schedule</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(() => {
                            // Create dynamic schedule based on doctor specialty
                            const getScheduleForSpecialty = (specialty) => {
                              if (specialty?.toLowerCase().includes('dermatology')) {
                                return [
                                  { day: 'Monday', hours: '09:00 - 17:00' },
                                  { day: 'Tuesday', hours: '09:00 - 17:00' },
                                  { day: 'Wednesday', hours: '09:00 - 17:00' },
                                  { day: 'Thursday', hours: '09:00 - 17:00' },
                                  { day: 'Friday', hours: '09:00 - 17:00' },
                                  { day: 'Saturday', hours: '09:00 - 14:00' },
                                  { day: 'Sunday', hours: 'Closed' }
                                ];
                              } else if (specialty?.toLowerCase().includes('cardiology')) {
                                return [
                                  { day: 'Monday', hours: '08:00 - 16:00' },
                                  { day: 'Tuesday', hours: '08:00 - 16:00' },
                                  { day: 'Wednesday', hours: '08:00 - 16:00' },
                                  { day: 'Thursday', hours: '08:00 - 16:00' },
                                  { day: 'Friday', hours: '08:00 - 14:00' },
                                  { day: 'Saturday', hours: 'Closed' },
                                  { day: 'Sunday', hours: 'Closed' }
                                ];
                              } else {
                                return [
                                  { day: 'Monday', hours: '09:00 - 17:00' },
                                  { day: 'Tuesday', hours: '09:00 - 17:00' },
                                  { day: 'Wednesday', hours: '09:00 - 17:00' },
                                  { day: 'Thursday', hours: '09:00 - 17:00' },
                                  { day: 'Friday', hours: '09:00 - 17:00' },
                                  { day: 'Saturday', hours: '09:00 - 14:00' },
                                  { day: 'Sunday', hours: 'Closed' }
                                ];
                              }
                            };
                            
                            return getScheduleForSpecialty(selectedDoctor.specialization || selectedDoctor.specialty);
                          })().map(schedule => (
                            <div key={schedule.day} className="bg-gray-50 p-3 rounded-md">
                              <div className="font-medium text-gray-900">{schedule.day}:</div>
                              <div className={`text-sm ${schedule.hours === 'Closed' ? 'text-red-600' : 'text-green-600'}`}>
                                {schedule.hours}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Appointment Details */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferred_appointment_date"
                    value={formData.preferred_appointment_date ? formData.preferred_appointment_date.split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        preferred_appointment_date: date ? `${date}T09:00` : ''
                      }));
                      // Clear error when user selects a date
                      if (errors.preferred_appointment_date) {
                        setErrors(prev => ({
                          ...prev,
                          preferred_appointment_date: ''
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.preferred_appointment_date ? 'border-red-500' : ''
                    }`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.preferred_appointment_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.preferred_appointment_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time *
                  </label>
                  <select
                    name="preferred_time"
                    value={formData.preferred_appointment_date ? formData.preferred_appointment_date.split('T')[1] : ''}
                    onChange={(e) => {
                      const time = e.target.value;
                      const date = formData.preferred_appointment_date ? formData.preferred_appointment_date.split('T')[0] : '';
                      if (date && time) {
                        setFormData(prev => ({
                          ...prev,
                          preferred_appointment_date: `${date}T${time}`
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.preferred_appointment_date || !formData.preferred_appointment_date.split('T')[0]}
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="16:30">04:30 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit *
                </label>
                <textarea
                  name="booking_reason"
                  value={formData.booking_reason}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.booking_reason ? 'border-red-500' : ''
                  }`}
                  placeholder="Brief description of your medical concern or symptoms"
                />
                {errors.booking_reason && (
                  <p className="text-red-500 text-sm mt-1">{errors.booking_reason}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Status
                </label>
                <select
                  name="appointment_status"
                  value={formData.appointment_status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {appointmentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {patient ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {patient ? 'Update Patient' : 'Add Patient'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
