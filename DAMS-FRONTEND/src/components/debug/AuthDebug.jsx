import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/apiService';

const AuthDebug = () => {
  const { user, token } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const info = {
      user: user,
      token: token ? token.substring(0, 20) + '...' : 'No token',
      localStorage_token: localStorage.getItem('auth_token') ? 
        localStorage.getItem('auth_token').substring(0, 20) + '...' : 'No token in localStorage',
      localStorage_user: localStorage.getItem('auth_user')
    };
    setDebugInfo(info);
  }, [user, token]);

  const testLogin = async () => {
    try {
      const response = await authAPI.login({
        email: 'admin@hospital.com',
        password: 'admin123'
      });
      setTestResults(prev => [...prev, { type: 'login', success: true, data: response }]);
    } catch (error) {
      setTestResults(prev => [...prev, { type: 'login', success: false, error: error.message }]);
    }
  };

  const testNotificationAPI = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setTestResults(prev => [...prev, { type: 'notifications', success: response.ok, data }]);
    } catch (error) {
      setTestResults(prev => [...prev, { type: 'notifications', success: false, error: error.message }]);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Authentication Debug</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Auth State:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Actions:</h3>
        <button 
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Admin Login
        </button>
        <button 
          onClick={testNotificationAPI}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Notifications API
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
        {testResults.map((result, index) => (
          <div key={index} className={`mb-2 p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <strong>{result.type}:</strong> {result.success ? 'Success' : 'Failed'}
            <pre className="text-sm mt-1 overflow-auto">
              {JSON.stringify(result.data || result.error, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthDebug;