import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Eye,
  Users,
  Stethoscope,
  Clock
} from 'lucide-react';
import BillingService from '../../api/billingService';

const InvoiceForm = ({ onClose, invoice = null, appointmentData = null }) => {
  const [formData, setFormData] = useState({
    patientId: invoice?.patient_id || appointmentData?.patient_id || '',
    patientName: invoice?.patient_name || appointmentData?.patient_name || '',
    patientEmail: invoice?.patient_email || appointmentData?.patient_email || '',
    patientPhone: invoice?.patient_phone || appointmentData?.patient_phone || '',
    patientAddress: invoice?.patient_address || appointmentData?.patient_address || '',
    doctorId: invoice?.doctor_id || appointmentData?.doctor_id || '',
    doctorName: invoice?.doctor_name || appointmentData?.doctor_name || '',
    appointmentId: invoice?.appointment_id || appointmentData?.id || '',
    invoiceDate: invoice?.invoice_date || new Date().toISOString().split('T')[0],
    dueDate: invoice?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: invoice?.items || [
      { service: 'Consultation', description: 'General consultation', quantity: 1, rate: 500, amount: 500 }
    ],
    subtotal: invoice?.subtotal || 500,
    taxAmount: invoice?.tax_amount || 0,
    discountAmount: invoice?.discount_amount || 0,
    totalAmount: invoice?.total_amount || 500,
    status: invoice?.status || 'draft',
    paymentStatus: invoice?.payment_status || 'pending',
    notes: invoice?.notes || '',
    paymentTerms: invoice?.payment_terms || '30 days'
  });

  const [errors, setErrors] = useState({});
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showDoctorSearch, setShowDoctorSearch] = useState(false);
  const [showAppointmentSearch, setShowAppointmentSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  // Data for dropdowns
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState({
    patients: false,
    doctors: false,
    appointments: false
  });

  // Load data on component mount
  useEffect(() => {
    setAnimateIn(true);
    loadInitialData();
    
    // Check for appointment data from sessionStorage
    const appointmentForBilling = sessionStorage.getItem('appointmentForBilling');
    if (appointmentForBilling) {
      try {
        const appointmentData = JSON.parse(appointmentForBilling);
        setFormData(prev => ({
          ...prev,
          appointmentId: appointmentData.appointmentId || '',
          patientName: appointmentData.patientName || '',
          patientEmail: appointmentData.patientEmail || '',
          patientPhone: appointmentData.patientPhone || '',
          doctorName: appointmentData.doctorName || '',
          notes: appointmentData.reason ? `Appointment reason: ${appointmentData.reason}` : ''
        }));
        
        // Clear the session storage after using it
        sessionStorage.removeItem('appointmentForBilling');
      } catch (error) {
        console.error('Error parsing appointment data from sessionStorage:', error);
      }
    }
  }, []);

  // Calculate totals when items change
  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxAmount, formData.discountAmount]);

  const loadInitialData = async () => {
    setLoading(prev => ({ ...prev, patients: true, doctors: true, appointments: true }));

    try {
      // Load patients
      const patientsResult = await BillingService.getPatients();
      if (patientsResult.success) {
        setPatients(patientsResult.data);
      }

      // Load doctors
      const doctorsResult = await BillingService.getDoctors();
      if (doctorsResult.success) {
        setDoctors(doctorsResult.data);
      }

      // Load appointments
      const appointmentsResult = await BillingService.getAppointments();
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading({ patients: false, doctors: false, appointments: false });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 1) * parseFloat(item.rate || 0));
    }, 0);

    const total = subtotal + (parseFloat(formData.taxAmount) || 0) - (parseFloat(formData.discountAmount) || 0);

    setFormData(prev => ({
      ...prev,
      subtotal,
      totalAmount: total
    }));
  };

  const services = [
    'Consultation',
    'Surgery',
    'Lab Tests',
    'X-Ray',
    'MRI Scan',
    'CT Scan',
    'Physical Therapy',
    'Dental Treatment',
    'Eye Examination',
    'Vaccination',
    'Emergency Care',
    'Follow-up Visit'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectPatient = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email || '',
      patientPhone: patient.phone || '',
      patientAddress: patient.address || ''
    }));
    setShowPatientSearch(false);
  };

  const selectDoctor = (doctor) => {
    setFormData(prev => ({
      ...prev,
      doctorId: doctor.id,
      doctorName: doctor.name || `Dr. ${doctor.first_name} ${doctor.last_name}`
    }));
    setShowDoctorSearch(false);
  };

  const selectAppointment = (appointment) => {
    setFormData(prev => ({
      ...prev,
      appointmentId: appointment.id,
      patientId: appointment.patient?.id || appointment.patient_id,
      patientName: appointment.patient?.name || appointment.patient_name,
      patientEmail: appointment.patient?.email || appointment.patient_email || '',
      patientPhone: appointment.patient?.phone || appointment.patient_phone || '',
      doctorId: appointment.doctor?.id || appointment.doctor_id,
      doctorName: appointment.doctor?.name || appointment.doctor_name || ''
    }));
    setShowAppointmentSearch(false);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { service: '', description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate amount for this item
      if (field === 'quantity' || field === 'rate') {
        const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newItems[index].quantity) || 0;
        const rate = field === 'rate' ? parseFloat(value) || 0 : parseFloat(newItems[index].rate) || 0;
        newItems[index].amount = quantity * rate;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientName) newErrors.patientName = 'Patient name is required';
    if (!formData.patientId) newErrors.patientId = 'Patient ID is required';
    if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    if (formData.items.some(item => !item.service || !item.rate || parseFloat(item.rate) <= 0)) {
      newErrors.items = 'All items must have a service and valid rate';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const billingData = {
        patient_id: formData.patientId,
        appointment_id: formData.appointmentId || null,
        doctor_id: formData.doctorId || null,
        patient_name: formData.patientName,
        patient_email: formData.patientEmail,
        patient_phone: formData.patientPhone,
        patient_address: formData.patientAddress,
        doctor_name: formData.doctorName,
        invoice_date: formData.invoiceDate,
        due_date: formData.dueDate,
        items: formData.items.map(item => ({
          service: item.service,
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.quantity || 1) * parseFloat(item.rate || 0)
        })),
        subtotal: parseFloat(formData.subtotal) || 0,
        tax_amount: parseFloat(formData.taxAmount) || 0,
        discount_amount: parseFloat(formData.discountAmount) || 0,
        total_amount: parseFloat(formData.totalAmount) || 0,
        status: formData.status || 'draft',
        payment_status: formData.paymentStatus || 'pending',
        notes: formData.notes || '',
        payment_terms: formData.paymentTerms || '30 days'
      };

      let result;
      if (invoice) {
        // Update existing billing
        result = await BillingService.updateBilling(invoice.id, billingData);
      } else {
        // Create new billing
        result = await BillingService.createBilling(billingData);
      }

      if (result.success) {
        console.log('✅ Billing saved successfully:', result.data);
        onClose?.(result.data); // Pass the created/updated billing data back
      } else {
        console.error('❌ Failed to save billing:', result.error);
        setErrors({ general: result.error || 'Failed to save billing' });
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setErrors({ general: error.message || 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all duration-500 ${animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        {/* Header */}
        <div className="relative bg-white/70 backdrop-blur-xl border-b border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {invoice ? 'Edit Invoice' : 'Create New Invoice'}
                </h2>
                <p className="text-gray-600 mt-1">Fill in the details to generate an invoice</p>
              </div>
            </div>
            
            <button
              onClick={() => onClose?.()}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Appointment Selection */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur"></div>
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Link to Appointment (Optional)
                </h3>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Appointment
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.appointmentId ? `Appointment #${formData.appointmentId}` : ''}
                      onFocus={() => setShowAppointmentSearch(true)}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                      placeholder="Search appointments to auto-fill patient/doctor info"
                      readOnly
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  
                  {/* Appointment Search Dropdown */}
                  {showAppointmentSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-white/20 shadow-xl z-20 max-h-48 overflow-y-auto">
                      {loading.appointments ? (
                        <div className="p-4 text-center text-gray-500">Loading appointments...</div>
                      ) : appointments.length > 0 ? (
                        appointments.map(appointment => (
                          <div
                            key={appointment.id}
                            onClick={() => selectAppointment(appointment)}
                            className="p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium text-gray-900">
                              {appointment.patient?.name || appointment.patient_name} → {appointment.doctor?.name || appointment.doctor_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.appointment_date} • {appointment.appointment_time}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No appointments found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Patient and Doctor Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Patient Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur"></div>
                <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Patient Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.patientName}
                          onChange={(e) => handleInputChange('patientName', e.target.value)}
                          onFocus={() => setShowPatientSearch(true)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${errors.patientName ? 'border-red-300' : 'border-white/20'}`}
                          placeholder="Search or enter patient name"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                      {errors.patientName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.patientName}
                        </p>
                      )}
                      
                      {/* Patient Search Dropdown */}
                      {showPatientSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-white/20 shadow-xl z-10 max-h-48 overflow-y-auto">
                          {loading.patients ? (
                            <div className="p-4 text-center text-gray-500">Loading patients...</div>
                          ) : patients.length > 0 ? (
                            patients.map(patient => (
                              <div
                                key={patient.id}
                                onClick={() => selectPatient(patient)}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                <p className="text-sm text-gray-600">{patient.email || 'No email'}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">No patients found</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            value={formData.patientEmail}
                            onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                            placeholder="patient@email.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={formData.patientPhone}
                            onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                            placeholder="+880171234567"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <textarea
                          value={formData.patientAddress}
                          onChange={(e) => handleInputChange('patientAddress', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                          rows="2"
                          placeholder="Patient address"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-2xl blur"></div>
                <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-green-600" />
                    Doctor & Invoice Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doctor
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.doctorName}
                          onChange={(e) => handleInputChange('doctorName', e.target.value)}
                          onFocus={() => setShowDoctorSearch(true)}
                          className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                          placeholder="Search or select doctor"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                      
                      {/* Doctor Search Dropdown */}
                      {showDoctorSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-white/20 shadow-xl z-10 max-h-48 overflow-y-auto">
                          {loading.doctors ? (
                            <div className="p-4 text-center text-gray-500">Loading doctors...</div>
                          ) : doctors.length > 0 ? (
                            doctors.map(doctor => (
                              <div
                                key={doctor.id}
                                onClick={() => selectDoctor(doctor)}
                                className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <p className="font-medium text-gray-900">
                                  {doctor.name || `Dr. ${doctor.first_name} ${doctor.last_name}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {doctor.specialty || doctor.specialization || 'General Medicine'}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">No doctors found</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Invoice Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.invoiceDate}
                            onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${errors.invoiceDate ? 'border-red-300' : 'border-white/20'}`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => handleInputChange('dueDate', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${errors.dueDate ? 'border-red-300' : 'border-white/20'}`}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Terms
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.paymentTerms}
                          onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        >
                          <option value="15 days">15 days</option>
                          <option value="30 days">30 days</option>
                          <option value="45 days">45 days</option>
                          <option value="60 days">60 days</option>
                          <option value="Due on receipt">Due on receipt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services/Items */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-2xl blur"></div>
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Services & Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                
                {errors.items && (
                  <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.items}
                  </p>
                )}
                
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-white/50 rounded-xl border border-white/20">
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service *
                        </label>
                        <select
                          value={item.service}
                          onChange={(e) => updateItem(index, 'service', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                        >
                          <option value="">Select service</option>
                          {services.map(service => (
                            <option key={service} value={service}>{service}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                          placeholder="Item description"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rate (৳) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900">
                          ৳{(item.quantity * item.rate || 0).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

           
            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={() => onClose?.()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {invoice ? 'Update Invoice' : 'Create Invoice'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPatientSearch(false);
            setShowDoctorSearch(false);
            setShowAppointmentSearch(false);
          }
        }}
      />
    </div>
  );
};

export default InvoiceForm;