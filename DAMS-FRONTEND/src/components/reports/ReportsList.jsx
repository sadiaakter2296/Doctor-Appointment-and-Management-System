import React, { useState, useEffect } from 'react';
import {
  Download,
  Search,
  Calendar,
  User,
  FileText,
  Printer,
  Mail,
  Eye,
  Filter,
  X,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import apiService from '../../api/apiService';
import { patientService } from '../../api/patientService';

const PatientReports = () => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportType, setReportType] = useState('comprehensive');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [recentReports, setRecentReports] = useState([]);

  // Load patients with billing records on component mount
  useEffect(() => {
    fetchAllPatients();
    fetchRecentReports();
  }, []);

  // Fetch all patients (not just those with billing records)
  const fetchAllPatients = async () => {
    try {
      setIsLoadingPatients(true);
      console.log('Fetching all patients...');
      
      // Check if we have an auth token
      const token = localStorage.getItem('auth_token');
      console.log('Auth token exists:', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
      }
      
      // Try to fetch all patients using patientService
      const patients = await patientService.getAll();
      console.log('Patients from patientService:', patients);
      
      if (Array.isArray(patients)) {
        console.log('Setting patients:', patients);
        setPatients(patients);
      } else {
        console.error('Invalid patient data format:', patients);
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      // If fetching all patients fails, try fetching only patients with billing records
      try {
        console.log('Trying fallback to patients with billing...');
        const billingData = await apiService.get('/reports/patients-with-billing');
        if (billingData.success || billingData.status === 'success') {
          const patientData = billingData.data || [];
          console.log('Setting patients from billing fallback:', patientData);
          setPatients(patientData);
        } else {
          console.error('Billing fallback also failed:', billingData);
          setPatients([]);
        }
      } catch (billingError) {
        console.error('Error fetching patients with billing:', billingError);
        setPatients([]);
      }
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Fetch patients who have billing records (backup method)
  const fetchPatientsWithBilling = async () => {
    try {
      setIsLoadingPatients(true);
      console.log('Fetching patients with billing records...');
      
      const data = await apiService.get('/reports/patients-with-billing');
      console.log('API Response:', data);
      
      if (data.success) {
        console.log('Setting patients:', data.data);
        setPatients(data.data || []);
      } else {
        console.error('API returned error:', data.message);
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Fetch recent reports
  const fetchRecentReports = async () => {
    try {
      const data = await apiService.get('/reports/recent');
      if (data.success) {
        setRecentReports(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      setRecentReports([]);
    }
  };

  // Sample report data
  const sampleReportData = {
    patient: { name: 'Ahmed Rahman', age: 35, gender: 'Male', phone: '+8801712345678' },
    appointments: [
      { date: '2025-08-10', doctor: 'Dr. Rahman', diagnosis: 'Hypertension', treatment: 'ACE inhibitors', status: 'Completed' },
      { date: '2025-07-15', doctor: 'Dr. Mehedi', diagnosis: 'Regular Checkup', treatment: 'Routine examination', status: 'Completed' },
      { date: '2025-06-20', doctor: 'Dr. Sadia', diagnosis: 'Back Pain', treatment: 'Physical therapy', status: 'Completed' }
    ],
    medications: [
      { name: 'Lisinopril 10mg', dosage: 'Once daily', duration: '30 days', prescribed: '2025-08-10' },
      { name: 'Ibuprofen 400mg', dosage: 'Twice daily', duration: '7 days', prescribed: '2025-06-20' }
    ],
    vitals: [
      { date: '2025-08-10', bp: '140/90', pulse: '78', temp: '98.6°F', weight: '75kg' },
      { date: '2025-07-15', bp: '135/85', pulse: '76', temp: '98.4°F', weight: '74kg' }
    ],
    totalVisits: 3,
    totalCost: '৳8,500',
    lastVisit: '2025-08-10'
  };

  // Report type options
  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Report', desc: 'Complete medical history and treatment summary' },
    { value: 'appointment', label: 'Appointment History', desc: 'List of all appointments and consultations' },
    { value: 'medication', label: 'Medication Report', desc: 'Prescribed medications and treatment history' },
    { value: 'financial', label: 'Financial Summary', desc: 'Payment history and outstanding balances' }
  ];

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate report
  const handleGenerateReport = async () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }

    setIsGenerating(true);
    
    try {
      const data = await apiService.post('/reports/generate', {
        patient_id: parseInt(selectedPatient),
        report_type: reportType,
        date_from: dateRange.from || null,
        date_to: dateRange.to || null
      });
      
      if (data.success) {
        setGeneratedReport(data.data);
        setShowPreview(true);
        
        // Refresh recent reports
        fetchRecentReports();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 transform transition-all duration-500';
        notification.innerHTML = `
          <div class="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/20">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <div class="font-bold">Report Generated Successfully!</div>
                <div class="text-sm opacity-90">Ready for export</div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.transform = 'translateX(120%)';
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }, 3000);
        
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      
      let errorMessage = 'Failed to generate report';
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error notification
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 z-50 transform transition-all duration-500';
      errorNotification.innerHTML = `
        <div class="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/20">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="font-bold">Report Generation Failed</div>
              <div class="text-sm opacity-90">${errorMessage}</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(errorNotification);
      setTimeout(() => {
        errorNotification.style.transform = 'translateX(120%)';
        errorNotification.style.opacity = '0';
        setTimeout(() => errorNotification.remove(), 300);
      }, 4000);
      
      // Fallback to sample data for demonstration
      const patient = patients.find(p => p.id.toString() === selectedPatient);
      if (patient) {
        setGeneratedReport({
          patient: patient,
          report_type: reportType,
          report_data: {
            patient: patient,
            appointments: [
              { date: '2025-08-10', time: '10:00', doctor: 'Dr. Rahman', status: 'completed', notes: 'Regular checkup' },
              { date: '2025-07-15', time: '14:30', doctor: 'Dr. Mehedi', status: 'completed', notes: 'Follow-up visit' }
            ],
            billings: [
              { date: '2025-08-10', amount: 2500, status: 'paid', services: 'Consultation' },
              { date: '2025-07-15', amount: 1800, status: 'paid', services: 'Follow-up' }
            ],
            summary: {
              total_visits: 2,
              total_amount: 4300,
              last_visit: '2025-08-10'
            }
          },
          generated_at: new Date().toISOString()
        });
        setShowPreview(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report as PDF
  const handleExportPDF = () => {
    if (!generatedReport) return;

    const reportContent = generateReportHTML(generatedReport);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Export report as CSV
  const handleExportCSV = () => {
    if (!generatedReport) return;

    const reportData = generatedReport.report_data;
    const csvData = [
      ['Patient Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      ['Report Type:', generatedReport.report_type],
      [''],
      ['Patient Information'],
      ['Name', reportData.patient.name],
      ['Age', reportData.patient.age || 'N/A'],
      ['Gender', reportData.patient.gender || 'N/A'],
      ['Phone', reportData.patient.phone || 'N/A'],
      ['Email', reportData.patient.email || 'N/A'],
      ['']
    ];

    // Add appointment data if available
    if (reportData.appointments && reportData.appointments.length > 0) {
      csvData.push(['Appointment History']);
      csvData.push(['Date', 'Time', 'Doctor', 'Status', 'Notes']);
      reportData.appointments.forEach(apt => {
        csvData.push([
          apt.date || 'N/A',
          apt.time || 'N/A',
          apt.doctor || 'N/A',
          apt.status || 'N/A',
          apt.notes || 'No notes'
        ]);
      });
      csvData.push(['']);
    }

    // Add billing data if available
    if (reportData.billings && reportData.billings.length > 0) {
      csvData.push(['Billing History']);
      csvData.push(['Date', 'Amount', 'Status', 'Services']);
      reportData.billings.forEach(bill => {
        csvData.push([
          bill.date || 'N/A',
          `৳${bill.amount || 0}`,
          bill.status || 'N/A',
          bill.services || 'N/A'
        ]);
      });
      csvData.push(['']);
    }

    // Add summary if available
    if (reportData.summary) {
      csvData.push(['Summary']);
      csvData.push(['Total Visits', reportData.summary.total_visits || 0]);
      csvData.push(['Total Amount', `৳${reportData.summary.total_amount || 0}`]);
      csvData.push(['Last Visit', reportData.summary.last_visit || 'N/A']);
    }

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `patient_report_${generatedReport.patient.name.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate HTML content for PDF export
  const generateReportHTML = (report) => {
    const reportData = report.report_data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Report - ${reportData.patient.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .patient-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .summary { background: #e3f2fd; padding: 20px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MediCare Pro</h1>
          <h2>Patient Medical Report</h2>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Report Type: ${report.report_type.replace('_', ' ').toUpperCase()}</p>
        </div>

        <div class="patient-info">
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> ${reportData.patient.name}</p>
          <p><strong>Age:</strong> ${reportData.patient.age || 'N/A'} years</p>
          <p><strong>Gender:</strong> ${reportData.patient.gender || 'N/A'}</p>
          <p><strong>Phone:</strong> ${reportData.patient.phone || 'N/A'}</p>
          <p><strong>Email:</strong> ${reportData.patient.email || 'N/A'}</p>
        </div>

        ${reportData.appointments && reportData.appointments.length > 0 ? `
        <div class="section">
          <div class="section-title">Appointment History</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.appointments.map(apt => `
                <tr>
                  <td>${apt.date || 'N/A'}</td>
                  <td>${apt.time || 'N/A'}</td>
                  <td>${apt.doctor || 'N/A'}</td>
                  <td>${apt.status || 'N/A'}</td>
                  <td>${apt.notes || 'No notes'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${reportData.billings && reportData.billings.length > 0 ? `
        <div class="section">
          <div class="section-title">Billing History</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Services</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.billings.map(bill => `
                <tr>
                  <td>${bill.date || 'N/A'}</td>
                  <td>৳${bill.amount || 0}</td>
                  <td>${bill.status || 'N/A'}</td>
                  <td>${bill.services || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${reportData.summary ? `
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Visits:</strong> ${reportData.summary.total_visits || 0}</p>
          <p><strong>Total Amount:</strong> ৳${reportData.summary.total_amount || 0}</p>
          <p><strong>Last Visit:</strong> ${reportData.summary.last_visit || 'N/A'}</p>
          ${reportData.summary.avg_visit_cost ? `<p><strong>Average Visit Cost:</strong> ৳${reportData.summary.avg_visit_cost}</p>` : ''}
        </div>
        ` : ''}

        <div class="footer">
          <p>This report is confidential and intended for medical purposes only.</p>
          <p>© 2025 MediCare Pro - Complete Clinic Management System</p>
        </div>
      </body>
      </html>
    `;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const time = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return { date, time };
  };

  const { date, time } = getCurrentDateTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20"></div>
          <div className="relative bg-white/70 backdrop-blur-xl rounded-lg p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Patient Reports
                </h1>
                <p className="text-gray-600 mt-2">Generate comprehensive patient medical reports</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
                <Calendar className="h-4 w-4" />
                <span>{date} • {time}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-2xl blur"></div>
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    Select Patient
                  </h3>
                  <button
                    onClick={fetchAllPatients}
                    disabled={isLoadingPatients}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className={`w-4 h-4 ${isLoadingPatients ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
                
                {/* Search Patients */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search patients by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl text-gray-700"
                  />
                </div>

                {/* Patient List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {isLoadingPatients ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="ml-3 text-gray-600">Loading patients...</span>
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="text-center p-6 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No patients found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Add patients to generate reports'}
                      </p>
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient.id.toString())}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-102 ${
                          selectedPatient === patient.id.toString()
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300 shadow-lg'
                            : 'bg-white/50 border-white/30 hover:bg-white/70 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-800">{patient.name}</p>
                              {selectedPatient === patient.id.toString() && (
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {patient.age ? `${patient.age} years` : 'Age N/A'} • {patient.gender || 'Gender N/A'}
                            </p>
                            <p className="text-sm text-gray-500">{patient.phone || 'Phone N/A'}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                              <div className="text-xs text-green-600">
                                {patient.total_amount ? (
                                  <>
                                    <span className="font-medium">৳{patient.total_amount?.toLocaleString()}</span>
                                    <span className="text-gray-500"> • {patient.total_billings || 0} bills</span>
                                  </>
                                ) : (
                                  <span className="text-gray-500">No billing records yet</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Last: {patient.last_visit || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Report Configuration */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur"></div>
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                  Report Configuration
                </h3>

                {/* Report Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() => setReportType(type.value)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-102 ${
                          reportType === type.value
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-lg'
                            : 'bg-white/50 border-white/30 hover:bg-white/70 hover:shadow-lg'
                        }`}
                      >
                        <p className="font-semibold text-gray-800">{type.label}</p>
                        <p className="text-sm text-gray-600 mt-1">{type.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl text-gray-700"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !selectedPatient}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Report Preview/Export */}
          <div className="space-y-6">
            {generatedReport ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl blur"></div>
                <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      Report Ready
                    </h3>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors duration-200"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Report Summary */}
                  <div className="bg-green-50/70 backdrop-blur-sm rounded-xl p-4 mb-6 border border-green-200/50">
                    <p className="font-semibold text-green-800">{generatedReport.patient.name}</p>
                    <p className="text-sm text-green-600 capitalize">{generatedReport.report_type.replace('_', ' ')} Report</p>
                    <p className="text-sm text-green-600">Generated: {new Date(generatedReport.generated_at).toLocaleString()}</p>
                  </div>

                  {/* Export Options */}
                  <div className="space-y-3">
                    <button
                      onClick={handleExportPDF}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
                    >
                      <Printer className="w-5 h-5" />
                      Export as PDF
                    </button>
                    
                    <button
                      onClick={handleExportCSV}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
                    >
                      <Download className="w-5 h-5" />
                      Export as CSV
                    </button>
                  </div>

                 
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-slate-400/20 rounded-2xl blur"></div>
                <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center">
                  <div className="p-6 bg-gray-100/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">No Report Generated</h3>
                  <p className="text-sm text-gray-600">Select a patient and generate a report to see export options</p>
                </div>
              </div>
            )}

          
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mt-12">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-gray-100 blur"></div>
        <div className="relative bg-white/70 backdrop-blur-xl border-t border-white/20 px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2025 MediCare Pro - Complete Clinic Management System
            </p>
            <p className="text-sm text-gray-600">
              {date} • {time}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientReports;
