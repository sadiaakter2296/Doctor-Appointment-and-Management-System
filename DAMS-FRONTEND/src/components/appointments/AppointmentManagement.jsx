import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User, Phone, Mail, Calendar, Clock, Eye, Edit, Trash2, RefreshCw, Loader } from "lucide-react";
import PatientDetailsModal from "../patients/PatientDetailsModal";
import { appointmentService } from "../../api/appointmentService";
import RoleProtection, { useRoleAccess } from '../auth/RoleProtection';
import { useAuth } from '../../context/AuthContext';

// Cache for storing data across component remounts
const appointmentCache = {
  appointments: null,
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
};

const AppointmentManagement = () => {
  // Role-based access control
  const { isAdmin } = useRoleAccess();
  const { user } = useAuth(); // Get current logged-in user
  
  const [appointments, setAppointments] = useState(appointmentCache.appointments || []);
  const [loading, setLoading] = useState(false); // Start with false for instant page load
  const [refreshing, setRefreshing] = useState(false); // Separate loading state for refresh
  const [error, setError] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return appointmentCache.lastFetch && 
           (Date.now() - appointmentCache.lastFetch) < appointmentCache.cacheExpiry &&
           appointmentCache.appointments;
  }, []);

  // Fetch appointments with caching
  const fetchAppointments = useCallback(async (force = false) => {
    try {
      // If cache is valid and not forcing refresh, use cached data
      if (!force && isCacheValid()) {
        setAppointments(appointmentCache.appointments);
        return;
      }

      setRefreshing(true);
      setError(null);
      
      // Fetch appointments directly from the API
      const response = await appointmentService.getAll();
      const appointmentsData = response.data || response || [];
      
      console.log('📅 Fetched appointments:', appointmentsData);
      
      // Update cache
      appointmentCache.appointments = appointmentsData;
      appointmentCache.lastFetch = Date.now();
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
    } finally {
      setRefreshing(false);
    }
  }, [isCacheValid]);

  // Load appointments on component mount - with instant display if cached
  useEffect(() => {
    // If we have cached data, display it immediately
    if (isCacheValid()) {
      setAppointments(appointmentCache.appointments);
    } else {
      setLoading(true);
    }
    
    // Always try to load fresh data in the background
    fetchAppointments().finally(() => setLoading(false));
  }, [fetchAppointments, isCacheValid]);

  // Listen for new appointments created from patient form
  useEffect(() => {
    const handleAppointmentCreated = (event) => {
      console.log('🔄 AppointmentManagement: New appointment created, refreshing list...');
      fetchAppointments(true); // Force refresh when new appointment is created
    };

    window.addEventListener('appointmentCreated', handleAppointmentCreated);
    console.log('✅ AppointmentManagement: Event listener added for appointmentCreated');
    
    return () => {
      window.removeEventListener('appointmentCreated', handleAppointmentCreated);
      console.log('🗑️ AppointmentManagement: Event listener removed');
    };
  }, [fetchAppointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      if (newStatus === 'cancelled') {
        // Optimistically remove from UI immediately
        const updatedAppointments = appointments.filter(app => app.id !== appointmentId);
        setAppointments(updatedAppointments);
        appointmentCache.appointments = updatedAppointments;

        // Delete the appointment in background
        try {
          await appointmentService.delete(appointmentId);
          console.log('✅ Appointment cancelled/deleted');
        } catch (error) {
          // Restore data if deletion failed
          console.error('Error deleting appointment:', error);
          setError('Failed to cancel appointment');
          await fetchAppointments(true); // Force refresh to restore state
        }
      } else {
        // Optimistically update status in UI immediately
        const updatedAppointments = appointments.map(app => 
          app.id === appointmentId 
            ? { ...app, status: newStatus }
            : app
        );
        setAppointments(updatedAppointments);
        appointmentCache.appointments = updatedAppointments;

        // Update appointment status in background
        try {
          await appointmentService.updateStatus(appointmentId, newStatus);
          console.log(`✅ Appointment status updated to: ${newStatus}`);
        } catch (error) {
          // Restore data if update failed
          console.error('Error updating appointment status:', error);
          setError('Failed to update appointment');
          await fetchAppointments(true); // Force refresh to restore state
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError(`Failed to ${newStatus === 'cancelled' ? 'cancel' : 'update'} appointment`);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment? This will clear the appointment details from the patient record.')) {
      try {
        // Extract patient ID from the appointment ID format "patient-{id}"
        const patientId = appointmentId.replace('patient-', '');
        
        // Clear appointment details from patient record
        const response = await fetch(`http://localhost:8000/api/patients/${patientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            doctor_id: null,
            booking_reason: null,
            preferred_appointment_date: null,
            appointment_status: null
          })
        });
        
        if (response.ok) {
          console.log('✅ Patient appointment details cleared');
          // Remove from local state
          setAppointments(prev => prev.filter(app => app.id !== appointmentId));
        } else {
          console.error('Failed to clear patient appointment details:', response.status);
          setError('Failed to cancel appointment');
        }
      } catch (err) {
        console.error("Error canceling patient appointment:", err);
        setError("Failed to cancel appointment");
      }
    }
  };

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    fetchAppointments(true);
  }, [fetchAppointments]);

  // Filter appointments based on user role
  const filteredAppointments = useMemo(() => {
    if (!user) {
      return []; // No user logged in, show nothing
    }

    if (isAdmin()) {
      // Admin can see all appointments
      return appointments;
    } else {
      // Patients can only see their own appointments (filter by email)
      return appointments.filter(appointment => 
        appointment.patient_email === user.email
      );
    }
  }, [appointments, user, isAdmin]);

  const handleView = (appointment) => {
    console.log('👁️ Viewing patient details for appointment:', appointment.id);
    setViewingPatient(appointment.patient);
    setViewingAppointment(appointment);
    setShowPatientDetails(true);
  };

  const handleEdit = (appointment) => {
    console.log('✏️ Edit functionality for appointment:', appointment.id);
    // For now, just show an alert. You can implement edit modal later
    alert(`Edit functionality for ${appointment.patient ? appointment.patient.name : appointment.patient_name}'s appointment will be implemented here.`);
  };

  const handleClosePatientDetails = () => {
    setShowPatientDetails(false);
    setViewingPatient(null);
    setViewingAppointment(null);
  };

  if (loading && !filteredAppointments.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="h-6 w-6 animate-spin" />
          Loading appointments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button 
          onClick={() => fetchAppointments(true)}
          className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 min-h-screen">
      <div className="mb-8 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-blue-200/30">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              {isAdmin() ? 'Appointment Management' : 'My Appointments'}
              {refreshing && <Loader className="h-5 w-5 animate-spin text-blue-500" />}
            </h2>
            <p className="text-gray-600 mt-2">
              {isAdmin() 
                ? 'Comprehensive patient appointment oversight and management from patient records'
                : 'View and manage your personal appointment bookings'
              }
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            Total: {filteredAppointments.length}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            Confirmed: {filteredAppointments.filter(a => a.status === 'confirmed').length}
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
            Pending: {filteredAppointments.filter(a => a.status === 'pending').length}
          </span>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/30 shadow-xl">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {isAdmin() ? 'No appointments found' : 'No appointments yet'}
          </h3>
          <p className="text-gray-500">
            {isAdmin() 
              ? 'No patient appointments have been scheduled yet'
              : 'Visit the doctors page to book your first appointment'
            }
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/30 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-200/30">
              <thead className="bg-gradient-to-r from-blue-100/50 to-blue-200/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Patient Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Appointment Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200/20">
                {filteredAppointments.map((appointment, index) => (
                  <tr key={appointment.id} className={`hover:bg-blue-50/50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/50' : 'bg-blue-25/25'}`}>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-gray-900">
                            {appointment.patient ? appointment.patient.name : appointment.patient_name}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{appointment.patient_email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{appointment.patient_phone}</span>
                          </div>
                          {appointment.patient && (
                            <div className="text-xs text-blue-600 font-medium">
                              {appointment.patient.gender} • {appointment.patient.blood_type || 'N/A'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {appointment.doctor ? `Dr. ${appointment.doctor.name}` : 'Unknown Doctor'}
                      </div>
                      <div className="text-sm text-blue-600">
                        {appointment.doctor?.specialization || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{appointment.appointment_time}</span>
                        </div>
                        {appointment.reason && (
                          <div className="text-xs text-gray-600 max-w-xs truncate">
                            <span className="font-medium">Reason:</span> {appointment.reason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {appointment.status.toUpperCase()}
                        </span>
                        <RoleProtection allowedRoles={['admin']} hideIfUnauthorized={true}>
                          <select 
                            value={appointment.status}
                            onChange={(e) => handleStatusUpdate(appointment.id, e.target.value)}
                            className="block w-full text-xs border border-blue-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </RoleProtection>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleView(appointment)}
                          className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200" 
                          title="View Patient Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      <PatientDetailsModal
        patient={viewingPatient}
        appointment={viewingAppointment}
        isOpen={showPatientDetails}
        onClose={handleClosePatientDetails}
      />
    </div>
  );
};

export default AppointmentManagement;
