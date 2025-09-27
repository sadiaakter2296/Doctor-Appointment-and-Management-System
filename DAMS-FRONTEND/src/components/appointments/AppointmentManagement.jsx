import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Calendar, Clock, Eye, Edit, Trash2 } from "lucide-react";
import PatientDetailsModal from "../patients/PatientDetailsModal";
import { appointmentService } from "../../api/appointmentService";

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Listen for new appointments created from patient form
  useEffect(() => {
    const handleAppointmentCreated = (event) => {
      console.log('🔄 AppointmentManagement: New appointment created, refreshing list...');
      fetchAppointments(); // Refresh the appointment list
    };

    window.addEventListener('appointmentCreated', handleAppointmentCreated);
    console.log('✅ AppointmentManagement: Event listener added for appointmentCreated');
    
    return () => {
      window.removeEventListener('appointmentCreated', handleAppointmentCreated);
      console.log('🗑️ AppointmentManagement: Event listener removed');
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch appointments directly from the API
      const response = await appointmentService.getAll();
      const appointmentsData = response.data || response || [];
      
      console.log('📅 Fetched appointments:', appointmentsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      if (newStatus === 'cancelled') {
        // Delete the appointment
        await appointmentService.delete(appointmentId);
        console.log('✅ Appointment cancelled/deleted');
        // Remove from local state
        setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      } else {
        // Update appointment status
        await appointmentService.updateStatus(appointmentId, newStatus);
        console.log(`✅ Appointment status updated to: ${newStatus}`);
        // Update local state
        setAppointments(prev => 
          prev.map(app => 
            app.id === appointmentId 
              ? { ...app, status: newStatus }
              : app
          )
        );
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button 
          onClick={fetchAppointments}
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
          Appointment Management
        </h2>
        <p className="text-gray-600 mt-2">Comprehensive patient appointment oversight and management from patient records</p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            Total: {appointments.length}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            Confirmed: {appointments.filter(a => a.status === 'confirmed').length}
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
            Pending: {appointments.filter(a => a.status === 'pending').length}
          </span>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/30 shadow-xl">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments found</h3>
          <p className="text-gray-500">Schedule your first appointment to get started</p>
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
                {appointments.map((appointment, index) => (
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
