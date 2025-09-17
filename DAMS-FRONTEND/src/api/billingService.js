// Billing API Service
import apiService from './apiService';

const API_BASE_URL = 'http://localhost:8000/api';

class BillingService {
  // Get all billings with optional filters
  static async getAllBillings(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/billings?${queryString}` : '/billings';
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data, // This contains the full pagination object with data and meta
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error fetching billings:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get billing by ID
  static async getBillingById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error fetching billing:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Create new billing
  static async createBilling(billingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(billingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error creating billing:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Update billing
  static async updateBilling(id, billingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(billingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error updating billing:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Delete billing
  static async deleteBilling(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error deleting billing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mark billing as paid
  static async markAsPaid(id, paymentData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings/${id}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error marking billing as paid:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Add payment to billing
  static async addPayment(id, paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings/${id}/add-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error adding payment:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Get billing statistics
  static async getStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/billings-statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error fetching billing statistics:', error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  // Get billings by appointment
  static async getBillingsByAppointment(appointmentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings/appointment/${appointmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error fetching appointment billings:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get patients for billing (from patient service)
  static async getPatients() {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: 'Patients retrieved successfully'
      };
    } catch (error) {
      console.error('🔴 Error fetching patients for billing:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get doctors for billing (from doctor service)
  static async getDoctors() {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: 'Doctors retrieved successfully'
      };
    } catch (error) {
      console.error('🔴 Error fetching doctors for billing:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get appointments for billing (from appointment service)
  static async getAppointments() {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: 'Appointments retrieved successfully'
      };
    } catch (error) {
      console.error('🔴 Error fetching appointments for billing:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Format currency
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }

  // Format date
  static formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get status badge color
  static getStatusColor(status) {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  }

  // Get payment status badge color
  static getPaymentStatusColor(paymentStatus) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return colors[paymentStatus] || colors.pending;
  }

  // Get billings by appointment
  static async getBillingsByAppointment(appointmentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings/appointment/${appointmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error fetching appointment billings:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Create billing from appointment
  static async createFromAppointment(appointmentId, billingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/billings/appointment/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(billingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 Error creating billing from appointment:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

export default BillingService;