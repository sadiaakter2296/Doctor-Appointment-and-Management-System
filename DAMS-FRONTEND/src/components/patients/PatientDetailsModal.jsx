import React from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Activity,
  AlertCircle,
  Clock,
  UserCheck,
  FileText,
  Shield,
  Contact,
  X
} from 'lucide-react';
import { format } from 'date-fns';

const PatientDetailsModal = ({ patient, appointment, isOpen, onClose }) => {
  if (!isOpen || !patient) return null;

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      // Check if the date is valid
      if (isNaN(birthDate.getTime())) return 'N/A';
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'N/A';
    }
  };

  const formatSafeDate = (date, formatString = 'MMM d, yyyy') => {
    if (!date) return 'Not provided';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      return format(dateObj, formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Patient Details</h3>
                  <p className="text-blue-100">{patient.name || 'Unknown Patient'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-[80vh] overflow-y-auto">
            <div className="space-y-6">
              
              {/* Personal Information */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Full Name</p>
                        <p className="text-gray-900 font-semibold">{patient.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Date of Birth</p>
                        <p className="text-gray-900">{formatSafeDate(patient.date_of_birth)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Age</p>
                        <p className="text-gray-900 font-semibold">{calculateAge(patient.date_of_birth)} years</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Gender</p>
                        <p className="text-gray-900">{patient.gender || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Blood Type</p>
                        <p className="text-gray-900 font-semibold">{patient.blood_type || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {patient.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Address</p>
                        <p className="text-gray-900 text-sm leading-relaxed">{patient.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <Contact className="w-5 h-5" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-700">Email Address</p>
                        <p className="text-gray-900">{patient.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-700">Phone Number</p>
                        <p className="text-gray-900 font-semibold">{patient.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-green-700">Emergency Contact</p>
                        <p className="text-gray-900 font-semibold">{patient.emergency_contact || 'Not provided'}</p>
                      </div>
                    </div>
                    {patient.emergency_contact_name && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-green-700">Emergency Contact Name</p>
                          <p className="text-gray-900">{patient.emergency_contact_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Medical Information
                </h4>
                <div className="space-y-4">
                  {patient.medical_history && (
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-purple-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-700 mb-2">Medical History</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{patient.medical_history}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {patient.allergies && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                            <span>⚠️ Allergies (CRITICAL INFORMATION)</span>
                          </p>
                          <p className="text-red-800 text-sm leading-relaxed font-medium">{patient.allergies}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!patient.medical_history && !patient.allergies && (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No medical information recorded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Information */}
              {(patient.insurance_provider || patient.insurance_policy_number) && (
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                  <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Insurance Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.insurance_provider && (
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-indigo-700">Insurance Provider</p>
                          <p className="text-gray-900">{patient.insurance_provider}</p>
                        </div>
                      </div>
                    )}
                    {patient.insurance_policy_number && (
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-indigo-700">Policy Number</p>
                          <p className="text-gray-900 font-mono">{patient.insurance_policy_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Appointment Information */}
              {appointment && (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Current Appointment Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Appointment Date</p>
                        <p className="text-gray-900 font-semibold">{formatSafeDate(appointment.appointment_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Time</p>
                        <p className="text-gray-900 font-semibold">{appointment.appointment_time || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Doctor</p>
                        <p className="text-gray-900">{appointment.doctor ? `Dr. ${appointment.doctor.name}` : 'Not assigned'}</p>
                      </div>
                    </div>
                    {appointment.reason && (
                      <div className="col-span-full">
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-yellow-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-yellow-700 mb-1">Reason for Visit</p>
                            <p className="text-gray-900 text-sm">{appointment.reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Registration Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Registration Date</p>
                      <p className="text-gray-900">{formatSafeDate(patient.created_at, 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated</p>
                      <p className="text-gray-900">{formatSafeDate(patient.updated_at, 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;