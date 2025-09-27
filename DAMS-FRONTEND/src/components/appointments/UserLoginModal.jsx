import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Clock, FileText, MapPin, Heart, Droplet } from 'lucide-react';
import appointmentService from '../../api/appointmentService';
import SuccessModal from './SuccessModal';

const UserLoginModal = ({ isOpen, onClose, doctor, onSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [error, setError] = useState('');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    appointment_date: '',
    appointment_time: '',
    reason: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    age: '',
    gender: '',
    blood_type: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simple mock authentication for now
      if (loginForm.email && loginForm.password) {
        const mockUser = {
          id: 1,
          name: loginForm.email.split('@')[0],
          email: loginForm.email,
          phone: '01700000000'
        };
        setUser(mockUser);
        setAppointmentForm(prev => ({
          ...prev,
          patient_name: mockUser.name,
          patient_email: mockUser.email,
          patient_phone: mockUser.phone
        }));
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simple mock registration for now
      if (registerForm.name && registerForm.email && registerForm.password) {
        const mockUser = {
          id: Date.now(),
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone
        };
        setUser(mockUser);
        setAppointmentForm(prev => ({
          ...prev,
          patient_name: mockUser.name,
          patient_email: mockUser.email,
          patient_phone: mockUser.phone
        }));
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Booking appointment with data:', {
        doctor_id: doctor.id,
        patient_name: appointmentForm.patient_name,
        patient_email: appointmentForm.patient_email,
        patient_phone: appointmentForm.patient_phone,
        appointment_date: appointmentForm.appointment_date,
        appointment_time: appointmentForm.appointment_time,
        reason: appointmentForm.reason,
        age: appointmentForm.age,
        gender: appointmentForm.gender,
        blood_type: appointmentForm.blood_type,
        status: 'pending'
      });

      const appointmentData = {
        doctor_id: doctor.id,
        patient_name: appointmentForm.patient_name,
        patient_email: appointmentForm.patient_email,
        patient_phone: appointmentForm.patient_phone,
        appointment_date: appointmentForm.appointment_date,
        appointment_time: appointmentForm.appointment_time,
        reason: appointmentForm.reason,
        age: appointmentForm.age,
        gender: appointmentForm.gender,
        blood_type: appointmentForm.blood_type,
        status: 'pending'
      };

      const response = await appointmentService.create(appointmentData);
      console.log('Appointment response:', response);
      
      if (response) {
        const appointmentResult = response.data || response;
        setBookedAppointment(appointmentResult);
        setShowSuccess(true);
        onSuccess && onSuccess(appointmentResult);
      }
    } catch (error) {
      console.error('Detailed booking error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to book appointment. Please try again.';
      
      // The apiService already processes the error, so use its message first
      if (error.message && error.message !== 'Failed to book appointment. Please try again.') {
        errorMessage = error.message;
      }
      // Fallback to response data if available
      else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 422) {
        errorMessage = 'Already booked this schedule. Select another time.';
      }
      
      console.log('Final error message:', errorMessage);
      
      // Create a custom alert modal instead of browser alert
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setIsLoginMode(true);
    setUser(null);
    setShowSuccess(false);
    setBookedAppointment(null);
    setError('');
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', password: '', phone: '' });
    setAppointmentForm({
      appointment_date: '',
      appointment_time: '',
      reason: '',
      patient_name: '',
      patient_email: '',
      patient_phone: '',
      age: '',
      gender: '',
      blood_type: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {!user ? (isLoginMode ? 'Login to Book' : 'Register to Book') : 'Book Appointment'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Dr. {doctor.name} - {doctor.specialty}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!user ? (
            // Login/Register Form
            <div>
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setIsLoginMode(true)}
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    isLoginMode
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLoginMode(false)}
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    !isLoginMode
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Register
                </button>
              </div>

              {isLoginMode ? (
                // Login Form
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Logging in...' : 'Login & Continue'}
                  </button>
                </form>
              ) : (
                // Register Form
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Registering...' : 'Register & Continue'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            // Appointment Booking Form
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {doctor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. {doctor.name}</h3>
                    <p className="text-blue-600 text-sm">{doctor.specialty}</p>
                    <p className="text-gray-600 text-sm">Fee: ৳{doctor.fee}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-green-700">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Patient: {user.name}</span>
                </div>
                <p className="text-green-600 text-sm mt-1">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentForm.appointment_date}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time
                  </label>
                  <select
                    required
                    value={appointmentForm.appointment_time}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Reason for Visit
                </label>
                <textarea
                  required
                  value={appointmentForm.reason}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe your symptoms or reason for the visit..."
                />
              </div>

              {/* Patient Information Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={appointmentForm.age}
                    onChange={(e) => {
                      setAppointmentForm(prev => ({ ...prev, age: e.target.value }));
                      setError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Gender
                  </label>
                  <select
                    required
                    value={appointmentForm.gender}
                    onChange={(e) => {
                      setAppointmentForm(prev => ({ ...prev, gender: e.target.value }));
                      setError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Droplet className="w-4 h-4 inline mr-1" />
                    Blood Type
                  </label>
                  <select
                    required
                    value={appointmentForm.blood_type}
                    onChange={(e) => {
                      setAppointmentForm(prev => ({ ...prev, blood_type: e.target.value }));
                      setError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setUser(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
        appointmentData={bookedAppointment}
        doctor={doctor}
      />
    </div>
  );
};

export default UserLoginModal;