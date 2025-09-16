import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Edit, 
  Trash2, 
  Plus, 
  Filter, 
  Search,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Activity,
  Download,
  CalendarPlus,
  Mail,
  Heart,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import AppointmentForm from './AppointmentForm';
import { format } from 'date-fns';

const AppointmentList = () => {
  const { updateAppointment } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formKey, setFormKey] = useState(Date.now()); // Add key to force refresh

  // Fetch appointments from API
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Listen for patient updates to refresh appointment form
  useEffect(() => {
    const handlePatientUpdate = (event) => {
      console.log('🔄 AppointmentList: Patient updated, refreshing form...');
      setFormKey(Date.now()); // Force refresh of AppointmentForm
    };

    const handleAppointmentCreated = (event) => {
      console.log('🔄 AppointmentList: New appointment created, refreshing list...');
      fetchAppointments(); // Refresh the appointment list
    };

    window.addEventListener('patientUpdated', handlePatientUpdate);
    window.addEventListener('appointmentCreated', handleAppointmentCreated);
    console.log('✅ AppointmentList: Event listeners added for patientUpdated and appointmentCreated');
    
    return () => {
      window.removeEventListener('patientUpdated', handlePatientUpdate);
      window.removeEventListener('appointmentCreated', handleAppointmentCreated);
      console.log('🗑️ AppointmentList: Event listeners removed');
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (appointment) => {
    return appointment.patient ? appointment.patient.name : appointment.patient_name;
  };

  const getDoctorName = (appointment) => {
    return appointment.doctor ? `Dr. ${appointment.doctor.name}` : 'Unknown Doctor';
  };

  const getPatientInfo = (appointment) => {
    return appointment.patient;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'from-yellow-500 to-yellow-600 text-white',
      confirmed: 'from-green-500 to-green-600 text-white',
      cancelled: 'from-red-500 to-red-600 text-white',
      completed: 'from-gray-500 to-gray-600 text-white'
    };
    return colors[status] || 'from-gray-500 to-gray-600 text-white';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = getPatientName(appointment).toLowerCase();
    const doctorName = getDoctorName(appointment).toLowerCase();
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || 
                         doctorName.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    let matchesDate = true;
    if (filterDate === 'today') {
      matchesDate = appointment.appointment_date === format(new Date(), 'yyyy-MM-dd');
    } else if (filterDate === 'week') {
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const appointmentDate = new Date(appointment.appointment_date);
      matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const updatedAppointment = await response.json();
        
        // Update local state immediately for better UX
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        ));
        
        // Update global state
        updateAppointment(appointmentId, { status: newStatus });
        
        // Show success feedback
        console.log(`Appointment ${appointmentId} status updated to: ${newStatus}`);
      } else {
        console.error('Failed to update appointment status');
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // You could add error toast notification here
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/appointments/${appointmentId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleEdit = (appointmentId) => {
    setEditingAppointment(appointmentId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleAppointmentSaved = (savedAppointment) => {
    console.log('Appointment saved, refreshing list...'); // Debug log
    fetchAppointments(); // Refresh the appointments list
    handleCloseForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-blue-200/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
              Appointment Schedule
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Comprehensive appointment management and tracking</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                setFormKey(Date.now()); // Force refresh of form data
                setShowForm(true);
              }} 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg hover:shadow-green-200/50 hover:scale-105 transition-all duration-300"
            >
              <CalendarPlus className="w-4 h-4" />
              New Appointment
            </Button>
            <button
              onClick={() => {
                console.log('Manually refreshing appointments...'); // Debug log
                fetchAppointments();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-200/50 hover:scale-105 transition-all duration-300"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-200/50 hover:scale-105 transition-all duration-300">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/30 shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients or doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-3 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl font-semibold">
            <Activity className="w-4 h-4" />
            <span>{filteredAppointments.length} appointments</span>
          </div>
        </div>
      </div>
        {/* Appointments List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/30 shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const patient = getPatientInfo(appointment);
              return (
                <div key={appointment.id} className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/30 p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-200/30 hover:scale-[1.02] transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{getPatientName(appointment)}</h3>
                        <p className="text-blue-600 font-semibold">{getDoctorName(appointment)}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {appointment.patient_email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {appointment.patient_phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getStatusColor(appointment.status)} rounded-xl shadow-lg font-semibold`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status.replace('-', ' ')}</span>
                      </div>
                      {/* Admin Status Update Dropdown */}
                      <div className="relative">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          title="Update Status"
                        >
                          <option value="pending">🕐 Pending</option>
                          <option value="confirmed">✅ Confirmed</option>
                          <option value="completed">🏁 Completed</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>
                      <div className="flex gap-2 opacity-100 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleEdit(appointment.id)}
                          className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-200/50 hover:scale-110 transition-all duration-300 rounded-xl"
                          title="Edit Appointment"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-200/50 hover:scale-110 transition-all duration-300 rounded-xl"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-200/50 hover:scale-110 transition-all duration-300 rounded-xl"
                          title="Delete Appointment"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200/50">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Date</p>
                        <p className="font-semibold text-green-800">{format(new Date(appointment.appointment_date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200/50">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Time</p>
                        <p className="font-semibold text-blue-800">{appointment.appointment_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200/50">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <UserCheck className="w-5 h-5 text-purple-700" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Gender</p>
                        <p className="font-semibold text-purple-800">{patient?.gender || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200/50">
                      <div className="p-2 bg-orange-200 rounded-lg">
                        <Heart className="w-5 h-5 text-orange-700" />
                      </div>
                      <div>
                        <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Blood Type</p>
                        <p className="font-semibold text-orange-800">{patient?.blood_type || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200/50">
                      <div className="p-2 bg-indigo-200 rounded-lg">
                        <User className="w-5 h-5 text-indigo-700" />
                      </div>
                      <div>
                        <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">Age</p>
                        <p className="font-semibold text-indigo-800">
                          {patient?.date_of_birth 
                            ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years`
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Information Section */}
                  {patient && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200/50">
                      <h4 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Complete Patient Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div><span className="font-medium text-indigo-700">Date of Birth:</span> <span className="text-gray-700">{new Date(patient.date_of_birth).toLocaleDateString()}</span></div>
                          <div><span className="font-medium text-indigo-700">Age:</span> <span className="text-gray-700">{new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years</span></div>
                          <div><span className="font-medium text-indigo-700">Gender:</span> <span className="text-gray-700">{patient.gender}</span></div>
                          <div><span className="font-medium text-indigo-700">Blood Type:</span> <span className="text-gray-700">{patient.blood_type || 'N/A'}</span></div>
                        </div>
                        <div className="space-y-2">
                          <div><span className="font-medium text-indigo-700">Email:</span> <span className="text-gray-700">{patient.email}</span></div>
                          <div><span className="font-medium text-indigo-700">Phone:</span> <span className="text-gray-700">{patient.phone}</span></div>
                          <div><span className="font-medium text-indigo-700">Emergency Contact:</span> <span className="text-gray-700">{patient.emergency_contact || 'N/A'}</span></div>
                        </div>
                        <div className="space-y-2">
                          {patient.address && (
                            <div><span className="font-medium text-indigo-700">Address:</span> <span className="text-gray-700">{patient.address}</span></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Medical Information */}
                      {(patient.medical_history || patient.allergies) && (
                        <div className="mt-4 pt-4 border-t border-indigo-200">
                          <h5 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Medical Information
                          </h5>
                          <div className="space-y-3">
                            {patient.medical_history && (
                              <div className="bg-white/60 p-3 rounded-lg">
                                <span className="font-medium text-indigo-700 block mb-1">Medical History:</span>
                                <p className="text-gray-700 text-xs leading-relaxed">{patient.medical_history}</p>
                              </div>
                            )}
                            {patient.allergies && (
                              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                <span className="font-medium text-red-700 block mb-1 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Allergies (IMPORTANT):
                                </span>
                                <p className="text-red-700 text-xs leading-relaxed font-medium">{patient.allergies}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {appointment.reason && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200/50">
                      <p className="text-sm font-semibold text-yellow-700 mb-2">Reason for Visit:</p>
                      <p className="text-sm text-yellow-800">{appointment.reason}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/30 shadow-xl">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No appointments found</h3>
              <p className="text-gray-600 mb-6 text-lg">No appointments match your current filters.</p>
              <Button 
                onClick={() => {
                  setFormKey(Date.now()); // Force refresh of form data
                  setShowForm(true);
                }} 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg hover:shadow-green-200/50 hover:scale-105 transition-all duration-300"
              >
                <CalendarPlus className="w-5 h-5" />
                Schedule New Appointment
              </Button>
            </div>
          )}
        </div>
      
      {/* Appointment Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
        size="lg"
      >
        <AppointmentForm
          key={formKey}
          appointmentId={editingAppointment}
          onClose={handleCloseForm}
          onAppointmentSaved={handleAppointmentSaved}
        />
      </Modal>
    </div>
  );
};

export default AppointmentList;
