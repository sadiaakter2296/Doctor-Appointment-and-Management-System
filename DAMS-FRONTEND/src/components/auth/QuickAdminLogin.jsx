import React from 'react';
import { useAuth } from '../../context/AuthContext';

const QuickAdminLogin = ({ onSuccess }) => {
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleQuickLogin = async () => {
    try {
      setLoading(true);
      await login({
        email: 'admin@hospital.com',
        password: 'admin123'
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reload the page to refresh with new token
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Quick login failed:', error);
      alert('Quick login failed. Please try manual login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-orange-800 font-semibold">Authentication Issue</h3>
          <p className="text-orange-700 text-sm">Your session has expired. Click to login as admin.</p>
        </div>
        <button
          onClick={handleQuickLogin}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Quick Admin Login'}
        </button>
      </div>
    </div>
  );
};

export default QuickAdminLogin;