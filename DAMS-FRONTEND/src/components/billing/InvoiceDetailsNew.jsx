import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Mail,
  Edit,
  Calendar,
  User,
  Building,
  Phone,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Copy,
  Share2,
  ArrowLeft,
  Receipt,
  Calculator,
  Eye,
  X
} from 'lucide-react';
import BillingService from '../../api/billingService';

const InvoiceDetailsNew = ({ billing, onClose, onEdit }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  if (!billing) {
    return null;
  }

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
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Mail },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: X }
    };
    return statusConfig[status] || statusConfig.draft;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      partial: { bg: 'bg-orange-100', text: 'text-orange-800', icon: CreditCard },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      refunded: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Receipt }
    };
    return statusConfig[paymentStatus] || statusConfig.pending;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    console.log('Downloading invoice:', billing.invoice_number);
    alert('Download functionality would be implemented here');
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(billing.invoice_number);
    alert('Invoice number copied to clipboard');
  };

  const handleMarkAsPaid = async () => {
    setIsLoading(true);
    try {
      const result = await BillingService.markAsPaid(billing.id);
      if (result.success) {
        console.log('✅ Invoice marked as paid');
        onClose?.(); // Close modal and refresh parent
      } else {
        alert('Failed to mark as paid: ' + result.error);
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Error marking as paid: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = await BillingService.addPayment(billing.id, {
        amount: parseFloat(paymentAmount),
        paid_at: new Date().toISOString()
      });
      
      if (result.success) {
        console.log('✅ Payment added successfully');
        setShowPaymentModal(false);
        setPaymentAmount('');
        onClose?.(); // Close modal and refresh parent
      } else {
        alert('Failed to add payment: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Error adding payment: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = getStatusBadge(billing.status);
  const paymentStatusConfig = getPaymentStatusBadge(billing.payment_status);

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-500 ${animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Invoice Details</h2>
                <p className="text-blue-100 mt-1">{billing.invoice_number}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200"
                title="Print Invoice"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => onEdit?.(billing)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200"
                title="Edit Invoice"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* Status and Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <statusConfig.icon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Status</span>
              </div>
              <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                {billing.status}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center gap-3 mb-2">
                <paymentStatusConfig.icon className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-600">Payment Status</span>
              </div>
              <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${paymentStatusConfig.bg} ${paymentStatusConfig.text}`}>
                {billing.payment_status}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-600">Total Amount</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(billing.total_amount)}
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Patient Information */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Patient Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900 font-medium">{billing.patient_name}</p>
                </div>
                {billing.patient_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{billing.patient_email}</p>
                  </div>
                )}
                {billing.patient_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{billing.patient_phone}</p>
                  </div>
                )}
                {billing.patient_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{billing.patient_address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-600" />
                Invoice Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Invoice Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">{billing.invoice_number}</span>
                    <button
                      onClick={handleCopyInvoiceNumber}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Issue Date</span>
                  <span className="text-gray-900">{formatDate(billing.invoice_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Due Date</span>
                  <span className="text-gray-900">{formatDate(billing.due_date)}</span>
                </div>
                {billing.doctor_name && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Doctor</span>
                    <span className="text-gray-900">{billing.doctor_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Payment Terms</span>
                  <span className="text-gray-900">{billing.payment_terms}</span>
                </div>
                {billing.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Paid Date</span>
                    <span className="text-gray-900">{formatDate(billing.paid_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Services & Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Service</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Qty</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Rate</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.items?.map((item, index) => (
                    <tr key={index} className="border-b border-purple-100 last:border-b-0">
                      <td className="py-3 text-gray-900 font-medium">{item.service}</td>
                      <td className="py-3 text-gray-600">{item.description || '-'}</td>
                      <td className="py-3 text-right text-gray-900">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-900">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-right text-gray-900 font-medium">
                        {formatCurrency(item.amount || (item.quantity * item.rate))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              {billing.notes && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Notes</h4>
                  <p className="text-gray-700">{billing.notes}</p>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                Payment Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(billing.subtotal)}</span>
                </div>
                {billing.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatCurrency(billing.tax_amount)}</span>
                  </div>
                )}
                {billing.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-red-600">-{formatCurrency(billing.discount_amount)}</span>
                  </div>
                )}
                <div className="border-t border-emerald-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(billing.total_amount)}</span>
                  </div>
                </div>
                {billing.paid_amount > 0 && billing.paid_amount < billing.total_amount && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid Amount</span>
                      <span className="text-green-600">{formatCurrency(billing.paid_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining</span>
                      <span className="text-red-600">{formatCurrency(billing.total_amount - billing.paid_amount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            {billing.payment_status !== 'paid' && (
              <>
                <button
                  onClick={handleMarkAsPaid}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Mark as Paid
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <CreditCard className="w-5 h-5" />
                  Add Payment
                </button>
              </>
            )}
            <button
              onClick={() => onEdit?.(billing)}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300"
            >
              <Edit className="w-5 h-5" />
              Edit Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={billing.total_amount - billing.paid_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Enter payment amount"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Remaining amount: {formatCurrency(billing.total_amount - billing.paid_amount)}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                disabled={isLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? 'Adding...' : 'Add Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsNew;