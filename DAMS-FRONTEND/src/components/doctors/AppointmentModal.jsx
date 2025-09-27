import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../api/doctorService';

const AppointmentModal = ({ isOpen, onClose, doctor }) => {
  const [appointmentData, setAppointmentData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [doctorSchedule, setDoctorSchedule] = useState(null);

  // Days of the week
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  useEffect(() => {
    if (isOpen && doctor) {
      setDoctorSchedule(doctor.working_hours || getDefaultSchedule());
      setError(null);
      setSuccess(false);
      setSelectedDate('');
      setAvailableSlots([]);
    }
  }, [isOpen, doctor]);

  // Load booked appointments when date is selected
  useEffect(() => {
    if (selectedDate && doctor) {
      loadBookedSlots(selectedDate);
    }
  }, [selectedDate, doctor]);

  const getDefaultSchedule = () => ({
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '09:00', end: '14:00' },
    sunday: { start: 'closed', end: 'closed' }
  });

  const loadBookedSlots = async (date) => {
    try {
      const response = await appointmentService.getByDoctor(doctor.id);
      const appointments = response.data || response;
      
      // Filter appointments for the selected date
      const dateAppointments = appointments.filter(apt => 
        apt.appointment_date === date && apt.status !== 'cancelled'
      );
      
      const booked = dateAppointments.map(apt => apt.appointment_time);
      setBookedSlots(booked);
      
      // Generate available slots for the selected date
      generateAvailableSlots(date, booked);
    } catch (error) {
      console.error('Error loading booked slots:', error);
      // If error, still generate slots without booked ones
      generateAvailableSlots(date, []);
    }
  };

  const generateAvailableSlots = (date, booked = []) => {
    const dayOfWeek = daysOfWeek[new Date(date).getDay()];
    const daySchedule = doctorSchedule[dayOfWeek];
    
    if (!daySchedule || daySchedule.start === 'closed') {
      setAvailableSlots([]);
      return;
    }

    const slots = [];
    const startTime = daySchedule.start;
    const endTime = daySchedule.end;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      
      // Check if slot is not booked
      if (!booked.includes(timeSlot)) {
        slots.push(timeSlot);
      }
      
      // Increment by 30 minutes
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // When date is selected, update selectedDate to trigger slot loading
    if (name === 'appointment_date') {
      setSelectedDate(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const appointmentPayload = {
        ...appointmentData,
        doctor_id: doctor.id,
        status: 'pending'
      };

      const appointmentResult = await appointmentService.create(appointmentPayload);
      console.log('✅ Appointment created successfully:', appointmentResult);
      
      // Dispatch appointment created event to notify other components
      console.log('📡 AppointmentModal: Dispatching appointmentCreated event');
      window.dispatchEvent(new CustomEvent('appointmentCreated', { 
        detail: { appointment: appointmentResult.data || appointmentResult } 
      }));
      
      setSuccess(true);
      setAppointmentData({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        appointment_date: '',
        appointment_time: '',
        reason: ''
      });
      setSelectedDate('');
      setAvailableSlots([]);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isDateAvailable = (dateString) => {
    const dayOfWeek = daysOfWeek[new Date(dateString).getDay()];
    const daySchedule = doctorSchedule && doctorSchedule[dayOfWeek];
    return daySchedule && daySchedule.start !== 'closed';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Book Appointment with Dr. {doctor?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ Appointment booked successfully!
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctor Information & Schedule */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Doctor Information</h3>
              <p><strong>Name:</strong> Dr. {doctor?.name}</p>
              <p><strong>Specialty:</strong> {doctor?.specialty}</p>
              <p><strong>Experience:</strong> {doctor?.experience} years</p>
              <p><strong>Consultation Fee:</strong> ৳{doctor?.fee}</p>
              <p><strong>Location:</strong> {doctor?.location}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Doctor's Schedule</h3>
              <div className="space-y-2">
                {doctorSchedule && Object.entries(doctorSchedule).map(([day, schedule]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="font-medium capitalize">{day}:</span>
                    <span className={`px-2 py-1 rounded ${
                      schedule.start === 'closed' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {schedule.start === 'closed' ? 'Closed' : `${schedule.start} - ${schedule.end}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  Available Times for {getDayName(selectedDate)} ({selectedDate})
                </h3>
                {!isDateAvailable(selectedDate) ? (
                  <p className="text-red-600">Doctor is not available on this day.</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-orange-600">No available slots for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setAppointmentData(prev => ({ ...prev, appointment_time: slot }))}
                        className={`px-3 py-2 text-sm rounded border ${
                          appointmentData.appointment_time === slot
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Appointment Form */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Appointment Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patient_name"
                  value={appointmentData.patient_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Email *
                </label>
                <input
                  type="email"
                  name="patient_email"
                  value={appointmentData.patient_email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="patient@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Phone *
                </label>
                <input
                  type="tel"
                  name="patient_phone"
                  value={appointmentData.patient_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="number only"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  value={appointmentData.appointment_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedDate && !isDateAvailable(selectedDate) && (
                  <p className="text-red-500 text-sm mt-1">
                    Doctor is not available on {getDayName(selectedDate)}s
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time *
                </label>
                <select
                  name="appointment_time"
                  value={appointmentData.appointment_time}
                  onChange={handleInputChange}
                  required
                  disabled={!selectedDate || !isDateAvailable(selectedDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {!selectedDate 
                      ? 'Select a date first' 
                      : !isDateAvailable(selectedDate)
                      ? 'Doctor not available this day'
                      : availableSlots.length === 0
                      ? 'No available slots'
                      : 'Select Time'
                    }
                  </option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>
                      {slot} {bookedSlots.includes(slot) ? '(Booked)' : '(Available)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={appointmentData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your medical concern or symptoms"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedDate || !isDateAvailable(selectedDate) || availableSlots.length === 0}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
