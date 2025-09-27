import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  
  Star,
  Phone,
  Mail,
  Award,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  TrendingUp,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  X,
  RefreshCw,
  Loader
} from 'lucide-react';
import { doctorService } from '../../api/doctorService';
import DoctorForm from './DoctorForm';
import UserLoginModal from '../appointments/UserLoginModal';
import RoleProtection, { useRoleAccess } from '../auth/RoleProtection';

// Cache for storing data across component remounts
const doctorCache = {
  doctors: null,
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
};

const DoctorPage = () => {
  // Role-based access control
  const { canBookAppointments, canManageDoctors, canViewDoctorDetails, isAdmin, isPatient } = useRoleAccess();
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDoctorDetails, setShowDoctorDetails] = useState(null);
  const [doctors, setDoctors] = useState(doctorCache.doctors || []);
  const [loading, setLoading] = useState(false); // Start with false for instant page load
  const [refreshing, setRefreshing] = useState(false); // Separate loading state for refresh
  const [error, setError] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(null);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return doctorCache.lastFetch && 
           (Date.now() - doctorCache.lastFetch) < doctorCache.cacheExpiry &&
           doctorCache.doctors;
  }, []);

  // Load doctors with caching
  const loadDoctors = useCallback(async (force = false) => {
    try {
      // If cache is valid and not forcing refresh, use cached data
      if (!force && isCacheValid()) {
        setDoctors(doctorCache.doctors);
        return;
      }

      setRefreshing(true);
      console.log('Loading doctors from API...');
      const response = await doctorService.getAllDoctors();
      console.log('Doctors loaded successfully:', response);
      
      // Handle different response structures
      const doctorsData = response?.data || response || [];
      console.log('Setting doctors data:', doctorsData);
      
      const doctors = Array.isArray(doctorsData) ? doctorsData : [];
      
      // Update cache
      doctorCache.doctors = doctors;
      doctorCache.lastFetch = Date.now();
      
      setDoctors(doctors);
      setError('');
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors: ' + (err.message || 'Unknown error'));
      // Set empty array on error to show empty state instead of breaking
      setDoctors([]);
    } finally {
      setRefreshing(false);
    }
  }, [isCacheValid]);

  // Load doctors on component mount - with instant display if cached
  useEffect(() => {
    // If we have cached data, display it immediately
    if (isCacheValid()) {
      setDoctors(doctorCache.doctors);
    } else {
      setLoading(true);
    }
    
    // Always try to load fresh data in the background
    loadDoctors().finally(() => setLoading(false));
  }, [loadDoctors, isCacheValid]);

  const handleDeleteDoctor = async (doctorId) => {
    try {
      // Optimistic delete - remove from UI immediately
      const updatedDoctors = doctors.filter(d => d.id !== doctorId);
      setDoctors(updatedDoctors);
      doctorCache.doctors = updatedDoctors;
      
      setShowDeleteConfirm(null);
      
      // Perform actual deletion in background
      try {
        await doctorService.deleteDoctor(doctorId);
        // Success - the optimistic update was correct
      } catch (err) {
        // Failure - restore the data
        console.error('Error deleting doctor:', err);
        setError('Failed to delete doctor');
        await loadDoctors(true); // Force refresh to restore state
      }
    } catch (err) {
      setError('Failed to delete doctor');
      console.error('Error deleting doctor:', err);
    }
  };

  const handleAddDoctor = async (doctorData) => {
    try {
      console.log('Adding doctor with data:', doctorData);
      setError(''); // Clear any previous errors
      
      const response = await doctorService.createDoctor(doctorData);
      console.log('Doctor added successfully:', response);
      
      // Reload doctors list with force refresh to get latest data
      await loadDoctors(true);
      setShowForm(false);
      
      // Show success message
      alert('Doctor added successfully!');
    } catch (err) {
      console.error('Error adding doctor:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add doctor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleEdit = async (doctorData) => {
    try {
      await doctorService.updateDoctor(editingDoctor.id, doctorData);
      await loadDoctors(true); // Force refresh to get updated data
      setEditingDoctor(null);
      setShowForm(false);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update doctor');
    }
  };

  const openEditForm = (doctor) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDoctor(null);
  };

  // Filter doctors based on search term and specialty - with memoization
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === '' || doctor.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

  // Get unique specialties for filter dropdown - with memoization
  const specialties = useMemo(() => {
    return [...new Set(doctors.map(doctor => doctor.specialty))];
  }, [doctors]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    loadDoctors(true);
  }, [loadDoctors]);

  // Handler functions for all buttons
  const handleAddDoctorClick = () => {
    setShowForm(true);
  };

  const handleExportData = () => {
    const csvContent = doctors.map(doctor => 
      `${doctor.name},${doctor.specialty},${doctor.experience},${doctor.phone},${doctor.email},${doctor.fee},${doctor.status}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doctors.csv';
    a.click();
  };

  const handleViewDetails = (doctor) => {
    setShowDoctorDetails(doctor);
  };

  const handleEditDoctorClick = (doctor) => {
    openEditForm(doctor);
  };

  const handleBookAppointment = (doctor) => {
    if (!canBookAppointments()) {
      alert('Only patients and users can book appointments. Please login as a patient or contact admin.');
      return;
    }
    setShowBookingModal(doctor);
  };

  const handleBookingSuccess = (appointmentData) => {
    console.log('Appointment booked successfully:', appointmentData);
    // Force refresh data
    loadDoctors();
    // You could also trigger a global state update here if using Redux/Context
  };

  const handleMessageDoctor = (doctorId) => {
    alert(`Messaging doctor ID: ${doctorId}`);
  };

  if (loading && !doctors.length) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader className="h-6 w-6 animate-spin" />
            Loading doctors...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              Doctor Management
              {refreshing && <Loader className="h-5 w-5 animate-spin text-blue-500" />}
            </h1>
            <p className="text-gray-600">
              Manage and monitor all medical professionals in your system
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <RoleProtection allowedRoles={['admin']} hideIfUnauthorized={true}>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleAddDoctorClick}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Add Doctor
              </button>
            </RoleProtection>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {doctors.filter(d => d.status === 'Available').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Specialties</p>
                <p className="text-2xl font-bold text-purple-600">{specialties.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Experience</p>
                <p className="text-2xl font-bold text-orange-600">
                  {doctors.length > 0 ? Math.round(doctors.reduce((acc, d) => acc + d.experience, 0) / doctors.length) : 0} yrs
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search doctors by name, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
             
              
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading doctors...</h3>
          <p className="text-gray-500">Please wait while we fetch the doctors.</p>
        </div>
      )}

      {/* Doctors Grid/List */}
      {!loading && (
        filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedSpecialty ? 'Try adjusting your search filters' : 'Get started by adding your first doctor'}
            </p>
            <RoleProtection allowedRoles={['admin']} hideIfUnauthorized={true}>
              <button
                onClick={handleAddDoctorClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300"
              >
                Add First Doctor
              </button>
            </RoleProtection>
          </div>
        ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredDoctors.map(doctor => (
            viewMode === 'grid' ? (
              // Grid View Card
              <div key={doctor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                      {doctor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.status === 'Available' ? 'bg-green-100 text-green-800' :
                    doctor.status === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {doctor.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{doctor.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">{doctor.experience} years exp</span>
                    </div>
                    <div className="text-blue-600 font-semibold">
                      ৳{doctor.fee}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-2">
                  {canBookAppointments() ? (
                    <button
                      onClick={() => handleBookAppointment(doctor)}
                      className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      Book Appointment
                    </button>
                  ) : (
                    <div className="w-full bg-gray-300 text-gray-500 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 cursor-not-allowed">
                      <Calendar className="w-3 h-3" />
                      Login as Patient to Book
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(doctor)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <RoleProtection allowedRoles={['admin']} hideIfUnauthorized={true}>
                    <button
                      onClick={() => handleEditDoctorClick(doctor)}
                      className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(doctor.id)}
                      className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </RoleProtection>
                </div>
              </div>
            ) : (
              // List View Row
              <div key={doctor.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {doctor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-blue-600 text-sm">{doctor.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                      <span>{doctor.experience} years</span>
                      <span>৳{doctor.fee}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.status === 'Available' ? 'bg-green-100 text-green-800' :
                        doctor.status === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doctor.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {canBookAppointments() ? (
                        <button
                          onClick={() => handleBookAppointment(doctor)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Book Appointment"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="p-2 text-gray-400 rounded-lg cursor-not-allowed" title="Login as Patient to Book">
                          <Calendar className="w-4 h-4" />
                        </div>
                      )}
                      <button
                        onClick={() => handleViewDetails(doctor)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <RoleProtection allowedRoles={['admin']} hideIfUnauthorized={true}>
                        <button
                          onClick={() => handleEditDoctorClick(doctor)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(doctor.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </RoleProtection>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
        )
      )}

      {/* Doctor Details Modal */}
      {showDoctorDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Doctor Details</h2>
                <button
                  onClick={() => setShowDoctorDetails(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  {showDoctorDetails.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{showDoctorDetails.name}</h3>
                  <p className="text-blue-600 font-semibold text-lg mb-2">{showDoctorDetails.specialty}</p>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      showDoctorDetails.status === 'Available' ? 'bg-green-100 text-green-800' :
                      showDoctorDetails.status === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {showDoctorDetails.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{showDoctorDetails.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{showDoctorDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{showDoctorDetails.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{showDoctorDetails.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Professional Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{showDoctorDetails.experience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Education:</span>
                      <span className="font-medium">{showDoctorDetails.education}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee:</span>
                      <span className="font-medium text-blue-600">৳{showDoctorDetails.fee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {showDoctorDetails.about && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700">{showDoctorDetails.about}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDoctorDetails(null);
                    handleEditDoctorClick(showDoctorDetails);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                  Edit Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Doctor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this doctor? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDoctor(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Form Modal */}
      {showForm && (
        <DoctorForm
          doctor={editingDoctor}
          onSave={editingDoctor ? handleEdit : handleAddDoctor}
          onCancel={closeForm}
          isEdit={!!editingDoctor}
        />
      )}

      {/* User Login and Appointment Booking Modal */}
      <UserLoginModal
        isOpen={!!showBookingModal}
        onClose={() => setShowBookingModal(null)}
        doctor={showBookingModal}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default DoctorPage;
