import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  CreditCard,
  User,
  FileText,
  Download,
  Eye,
  Edit,
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Grid,
  List,
  Plus,
  Trash2,
  RefreshCw,
  X
} from 'lucide-react';
import BillingService from '../../api/billingService';
import InvoiceFormNew from './InvoiceFormNew';
import InvoiceDetails from './InvoiceDetails';

const BillingListNew = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    loadBillings();
    loadStatistics();
  }, [searchTerm, statusFilter, paymentStatusFilter, dateFrom, dateTo, pagination.current_page]);

  const loadBillings = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(paymentStatusFilter && { payment_status: paymentStatusFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      const result = await BillingService.getAllBillings(params);
      
      if (result.success) {
        const billingsData = result.data.data || result.data;
        setBillings(billingsData);
        
        // Handle Laravel pagination structure
        if (result.data.current_page) {
          setPagination({
            current_page: result.data.current_page,
            per_page: result.data.per_page,
            total: result.data.total,
            last_page: result.data.last_page
          });
        }
      } else {
        console.error('Failed to load billings:', result.error);
      }
    } catch (error) {
      console.error('Error loading billings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await BillingService.getStatistics();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    if (field === 'status') setStatusFilter(value);
    if (field === 'payment_status') setPaymentStatusFilter(value);
    if (field === 'date_from') setDateFrom(value);
    if (field === 'date_to') setDateTo(value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPaymentStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleView = (billing) => {
    setSelectedBilling(billing);
    setShowInvoiceDetails(true);
  };

  const handleEdit = (billing) => {
    setSelectedBilling(billing);
    setShowInvoiceForm(true);
  };

  const handleDelete = async (billingId) => {
    if (!window.confirm('Are you sure you want to delete this billing record?')) {
      return;
    }

    try {
      const result = await BillingService.deleteBilling(billingId);
      if (result.success) {
        loadBillings(); // Refresh the list
        console.log('✅ Billing deleted successfully');
      } else {
        console.error('❌ Failed to delete billing:', result.error);
        alert('Failed to delete billing: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error deleting billing:', error);
      alert('Error deleting billing: ' + error.message);
    }
  };

  const handleMarkAsPaid = async (billingId) => {
    try {
      const result = await BillingService.markAsPaid(billingId);
      if (result.success) {
        loadBillings(); // Refresh the list
        loadStatistics(); // Refresh statistics
        console.log('✅ Billing marked as paid successfully');
      } else {
        console.error('❌ Failed to mark billing as paid:', result.error);
        alert('Failed to mark as paid: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error marking billing as paid:', error);
      alert('Error marking as paid: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return colors[paymentStatus] || colors.pending;
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="relative">
      <div className={`absolute inset-0 ${color} rounded-2xl blur opacity-20`}></div>
      <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {trend && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 ${color} rounded-xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Billing Management
            </h1>
            <p className="text-gray-600 mt-1">Manage invoices and payments</p>
          </div>
          <button
            onClick={() => setShowInvoiceForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(statistics.total_revenue || 0)}
            icon={DollarSign}
            color="bg-gradient-to-br from-emerald-500 to-teal-500"
            trend="+12.5%"
          />
          <StatCard
            title="Paid Revenue"
            value={formatCurrency(statistics.paid_revenue || 0)}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-emerald-500"
          />
          <StatCard
            title="Pending Revenue"
            value={formatCurrency(statistics.pending_revenue || 0)}
            icon={Clock}
            color="bg-gradient-to-br from-amber-500 to-orange-500"
          />
          <StatCard
            title="Overdue Amount"
            value={formatCurrency(statistics.overdue_amount || 0)}
            icon={AlertCircle}
            color="bg-gradient-to-br from-red-500 to-pink-500"
          />
        </div>

        {/* Filters and Search */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-blue-50/40 rounded-2xl blur"></div>
          <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search by invoice number, patient name, or email..."
                    className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-3 flex items-center gap-2 transition-colors duration-200 ${
                    viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 flex items-center gap-2 transition-colors duration-200 ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={loadBillings}
                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  >
                    <option value="">All Payment Status</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="From Date"
                  />

                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="To Date"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : billings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No billing records found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first invoice</p>
            <button
              onClick={() => setShowInvoiceForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-blue-50/40 rounded-2xl blur"></div>
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Invoice</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Patient</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Payment</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {billings.map((billing) => (
                      <tr key={billing.id} className="hover:bg-white/50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{billing.invoice_number}</p>
                            <p className="text-sm text-gray-600">Due: {formatDate(billing.due_date)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{billing.patient_name}</p>
                            <p className="text-sm text-gray-600">{billing.patient_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{formatCurrency(billing.total_amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(billing.status)}`}>
                            {billing.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadge(billing.payment_status)}`}>
                            {billing.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{formatDate(billing.invoice_date)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(billing)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(billing)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Edit Invoice"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {billing.payment_status !== 'paid' && (
                              <button
                                onClick={() => handleMarkAsPaid(billing.id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                                title="Mark as Paid"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(billing.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {billings.map((billing) => (
              <div key={billing.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-blue-50/40 rounded-2xl blur group-hover:blur-none transition-all duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 group-hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{billing.invoice_number}</h3>
                      <p className="text-sm text-gray-600">{billing.patient_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(billing.status)}`}>
                        {billing.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-semibold">{formatCurrency(billing.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusBadge(billing.payment_status)}`}>
                        {billing.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <span className="text-sm">{formatDate(billing.due_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(billing)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(billing)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Edit Invoice"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {billing.payment_status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(billing.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(billing.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                disabled={pagination.current_page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, current_page: page }))}
                    className={`px-3 py-2 border rounded-lg transition-colors duration-200 ${
                      pagination.current_page === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showInvoiceForm && (
        <InvoiceFormNew
          invoice={selectedBilling}
          onClose={(savedBilling) => {
            setShowInvoiceForm(false);
            setSelectedBilling(null);
            if (savedBilling) {
              loadBillings(); // Refresh the list
              loadStatistics(); // Refresh statistics
            }
          }}
        />
      )}

      {showInvoiceDetails && (
        <InvoiceDetails
          billing={selectedBilling}
          onClose={() => {
            setShowInvoiceDetails(false);
            setSelectedBilling(null);
          }}
          onEdit={() => {
            setShowInvoiceDetails(false);
            setShowInvoiceForm(true);
          }}
        />
      )}
    </div>
  );
};

export default BillingListNew;