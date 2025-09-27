import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const TokenFixer = () => {
  const { user, token, autoLoginAdmin, fixInvalidToken } = useAuth();
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    const checkAndFixToken = async () => {
      // If user exists but we're getting auth errors, try to fix
      if (user && user.email === 'admin@hospital.com' && token && !fixing && !fixed) {
        try {
          // Test the current token by making a simple API call
          const response = await fetch('http://localhost:8000/api/notifications', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.status === 401) {
            console.log('🔧 Token is invalid, attempting auto-fix...');
            setFixing(true);
            await fixInvalidToken();
            setFixed(true);
            console.log('✅ Token fixed successfully!');
          }
        } catch (error) {
          console.error('❌ Token fix failed:', error);
          setFixing(false);
        }
      }
    };

    // Only run this check if we have a user and token
    if (user && token) {
      checkAndFixToken();
    }
  }, [user, token, autoLoginAdmin, fixInvalidToken, fixing, fixed]);

  // Don't render anything visible
  return null;
};

export default TokenFixer;