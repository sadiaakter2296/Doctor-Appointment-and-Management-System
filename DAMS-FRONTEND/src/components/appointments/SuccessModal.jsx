import React from 'react';
import { CheckCircle, X, Calendar, User, Clock, FileText } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, appointmentData, doctor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Confirmed!</h2>
                <p className="text-sm text-gray-600">Your appointment has been scheduled</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Doctor Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  {doctor?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dr. {doctor?.name}</h3>
                  <p className="text-blue-600 text-sm">{doctor?.specialty}</p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="font-medium">Patient:</span> {appointmentData?.patient_name}
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="font-medium">Date:</span> {appointmentData?.appointment_date}
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="font-medium">Time:</span> {appointmentData?.appointment_time}
                </div>
              </div>

              {appointmentData?.reason && (
                <div className="flex items-start gap-3 text-gray-700">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium">Reason:</span> {appointmentData.reason}
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800 font-medium">Status: Pending Confirmation</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                The doctor will confirm your appointment shortly. You'll receive a notification once confirmed.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;