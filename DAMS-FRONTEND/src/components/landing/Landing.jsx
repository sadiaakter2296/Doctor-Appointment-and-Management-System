import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Login from '../auth/Login';
import Register from '../auth/Register';

const Landing = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center">
      <nav className="absolute top-0 w-full z-10 p-6">
        
      </nav>

      {!showRegister ? (
        <>
          <Login />
          <div className="absolute bottom-8 w-full flex justify-center mb-12">
            <button
              className="px-6 py-2 bg-white text-blue-600 rounded-full font-semibold shadow hover:bg-gray-100 transition-all duration-300"
              onClick={() => setShowRegister(true)}
            >
              Create Account
            </button>
          </div>
        </>
      ) : (
        <Register onClose={() => setShowRegister(false)} onSwitchToLogin={() => setShowRegister(false)} />
      )}
    </div>
  );
};

export default Landing;
