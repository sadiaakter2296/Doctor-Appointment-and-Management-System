import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Phone,
  Mail,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Droplet,
  Filter,
  Download,
  UserPlus,
  AlertTriangle,
  Loader,
  X
} from 'lucide-react';
import PatientForm from './PatientForm';
import { patientService } from '../../api/patientService';
import { appointmentService } from '../../api/appointmentService';

const PatientManagement = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('All Status');
  const [showFilters, setShowFilters] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [showPatientDetails, setShowPatientDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Load patients from backend
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both patients and appointments
      const [patientsData, appointmentsData] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll()
      ]);
      
      setPatients(patientsData || []);
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Combine patients and appointments into a unified patient list
  const combinedPatients = [
    // Existing patients (enhanced with latest appointment info)
    ...(patients || []).map(patient => {
      // Find the most recent appointment for this patient
      const patientAppointments = (appointments || []).filter(app => app.patient_email === patient.email);
      const latestAppointment = patientAppointments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
      return {
        ...patient,
        type: 'patient',
        id: `patient_${patient.id}`,
        originalId: patient.id, // Preserve original ID for deletion
        appointment_status: latestAppointment?.status || patient.appointment_status || 'N/A',
        doctor_name: latestAppointment?.doctor?.name || patient.doctor?.name || 'N/A',
        last_appointment: latestAppointment ? formatDate(latestAppointment.appointment_date) : (patient.preferred_appointment_date ? formatDate(patient.preferred_appointment_date) : 'N/A'),
        latest_appointment: latestAppointment, // Include full appointment details for reference
        reason: latestAppointment?.reason || patient.booking_reason || 'N/A'
      };
    }),
    // Appointment-based patient entries (only for appointments without existing patient records)
    ...(appointments || [])
      .filter(appointment => {
        // Only include appointments that don't have a corresponding patient record
        const existingPatient = (patients || []).find(patient => patient.email === appointment.patient_email);
        return !existingPatient;
      })
      .map(appointment => ({
        id: `appointment_${appointment.id}`,
        originalId: appointment.id, // Preserve original ID for deletion
        name: appointment.patient_name,
        email: appointment.patient_email,
        phone: appointment.patient_phone,
        type: 'appointment',
        appointment_id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        appointment_status: appointment.status,
        doctor_name: appointment.doctor?.name || 'Unknown',
      reason: appointment.reason,
      status: 'Active', // Default status for appointment-based entries
      blood_type: 'Unknown',
      date_of_birth: 'Unknown',
      gender: 'Unknown',
      last_appointment: formatDate(appointment.appointment_date)
    }))
  ];

  // Filter patients based on search term and blood type
  const filteredPatients = combinedPatients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone?.includes(searchTerm) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodType = selectedBloodType === '' || patient.blood_type === selectedBloodType;
    const matchesStatus = status === 'All Status' || patient.status === status;
    return matchesSearch && matchesBloodType && matchesStatus;
  });

  // Get unique blood types for filter
  const bloodTypes = [...new Set(combinedPatients.map(patient => patient.blood_type).filter(type => type && type !== 'Unknown'))];

  // Handler functions
  const handleAddPatient = () => {
    setSelectedPatient(null);
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientForm(true);
  };

  const handleDeletePatient = async (patientId) => {
    try {
      setLoading(true); // Show loading state during deletion
      
      // Find the patient object to determine type and original ID
      const patientToDelete = combinedPatients.find(p => p.id === patientId);
      
      if (!patientToDelete) {
        setError('Patient not found.');
        setShowDeleteConfirm(null);
        setLoading(false);
        return;
      }

      console.log('Deleting patient:', patientToDelete); // Debug log

      if (patientToDelete.type === 'patient') {
        // Real patient - delete from patients table
        console.log('Deleting real patient with ID:', patientToDelete.originalId);
        await patientService.delete(patientToDelete.originalId);
        setSuccess('Patient deleted successfully.');
      } else if (patientToDelete.type === 'appointment') {
        // Appointment-based entry - delete the appointment
        console.log('Deleting appointment with ID:', patientToDelete.originalId);
        await appointmentService.delete(patientToDelete.originalId);
        setSuccess('Appointment deleted successfully.');
      }
      
      await loadPatients(); // Reload patients
      setShowDeleteConfirm(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient. Please try again.');
      setShowDeleteConfirm(null);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAdded = async () => {
    await loadPatients(); // Reload patients
    setShowPatientForm(false);
  };

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return '-';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="h-6 w-6 animate-spin" />
          Loading patients...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-6 w-6 text-blue-500" />
              Patient Management
            </h1>
            <p className="text-gray-600 mt-1">Manage patient records and information</p>
          </div>
          <div className="flex flex-wrap gap-2">
            
            <button
              onClick={handleAddPatient}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add Patient
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select
                  value={selectedBloodType}
                  onChange={(e) => setSelectedBloodType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Blood Types</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBloodType('');
                    setStatus('All Status');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total Patients</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-1">{(patients || []).length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {(patients || []).filter(p => p.status === 'Active').length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">Inactive</span>
            </div>
            <p className="text-2xl font-bold text-red-700 mt-1">
              {(patients || []).filter(p => p.status === 'Inactive').length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Filtered</span>
            </div>
            <p className="text-2xl font-bold text-purple-700 mt-1">{filteredPatients.length}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
          <button 
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Patients Table */}
      <div className="p-6">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-4">
              {(patients || []).length === 0 
                ? "Get started by adding your first patient."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {(patients || []).length === 0 && (
              <button
                onClick={handleAddPatient}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Add First Patient
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Age/Gender</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Blood Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor Booking</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {patient.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {patient.date_of_birth && patient.date_of_birth !== 'Unknown' ? 
                            `${getAge(patient.date_of_birth)} years` : 
                            'Age N/A'
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          {patient.gender && patient.gender !== 'Unknown' ? patient.gender : 'Gender N/A'}
                        </div>
                        {patient.type === 'appointment' && (
                          <div className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                            Appointment Patient
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600">
                          {patient.blood_type || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {(patient.doctor_name && patient.doctor_name !== 'N/A' && patient.doctor_name !== 'Unknown') ? (
                          <div className="text-sm font-medium text-blue-600">
                            Dr. {patient.doctor_name}
                          </div>
                        ) : patient.doctor && (
                          <div className="text-sm font-medium text-blue-600">
                            Dr. {patient.doctor.name}
                          </div>
                        )}
                        
                        {patient.type === 'appointment' && patient.appointment_date && (
                          <div className="text-xs text-gray-600">
                            {formatDate(patient.appointment_date)} at {patient.appointment_time}
                          </div>
                        )}
                        
                        {patient.doctor && patient.doctor.specialization && (
                          <div className="text-xs text-gray-500">
                            {patient.doctor.specialization}
                          </div>
                        )}
                        
                        {patient.preferred_appointment_date && patient.type === 'patient' && (
                          <div className="text-xs text-gray-600">
                            {formatDate(patient.preferred_appointment_date)}
                          </div>
                        )}
                        
                        {patient.appointment_status && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            patient.appointment_status === 'confirmed' || patient.appointment_status === 'Confirmed'
                              ? 'bg-green-100 text-green-800' 
                              : patient.appointment_status === 'pending' || patient.appointment_status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : patient.appointment_status === 'completed' || patient.appointment_status === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {patient.appointment_status.charAt(0).toUpperCase() + patient.appointment_status.slice(1)}
                          </span>
                        )}
                        
                        {patient.type === 'appointment' && patient.reason && (
                          <div className="text-xs text-gray-500 mt-1">
                            Reason: {patient.reason}
                          </div>
                        )}
                        
                        {!patient.doctor_name && !patient.doctor && !patient.preferred_appointment_date && patient.type !== 'appointment' && (
                          <span className="text-sm text-gray-400">No booking</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patient.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPatientDetails(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Patient"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(patient.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Patient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Form Modal */}
      <PatientForm
        isOpen={showPatientForm}
        onClose={() => {
          setShowPatientForm(false);
          setSelectedPatient(null);
        }}
        onPatientAdded={handlePatientAdded}
        patient={selectedPatient}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Patient</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePatient(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Patient Details</h2>
              <button
                onClick={() => setShowPatientDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(showPatientDetails.date_of_birth)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.blood_type || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.emergency_contact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.status}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{showPatientDetails.address}</p>
              </div>
              {showPatientDetails.medical_history && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medical History</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.medical_history}</p>
                </div>
              )}
              {showPatientDetails.allergies && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Allergies</label>
                  <p className="mt-1 text-sm text-gray-900">{showPatientDetails.allergies}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
