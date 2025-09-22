import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Phone, 
  MessageCircle, 
  Download,
  ArrowRight,
  Star,
  Users,
  Clock,
  CheckCircle,
  Smartphone,
  Globe,
  Shield
} from 'lucide-react';

const PreFooter = () => {
  const navigate = useNavigate();

  const highlights = [
    {
      icon: Users,
      stat: '50,000+',
      label: 'Happy Patients',
      description: 'Trusted by thousands of patients worldwide'
    },
    {
      icon: Star,
      stat: '4.9/5',
      label: 'Rating',
      description: 'Excellent patient satisfaction rating'
    },
    {
      icon: Clock,
      stat: '24/7',
      label: 'Available',
      description: 'Round-the-clock emergency services'
    },
    {
      icon: Shield,
      stat: '100%',
      label: 'Secure',
      description: 'HIPAA-compliant data protection'
    }
  ];

  const features = [
    'Instant appointment booking',
    'Real-time doctor availability',
    'Secure video consultations',
    'Digital prescription management',
    'Comprehensive health records',
    'Insurance claim processing'
  ];

  const getColorClasses = (color, primary = false) => {
    const colors = {
      blue: primary 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
        : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      red: 'bg-red-50 text-red-600 hover:bg-red-100',
      green: 'bg-green-50 text-green-600 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    };
    return colors[color];
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        

        {/* Features Highlight */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="flex justify-center">
            
            {/* Content */}
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900">
                  Everything You Need in One Platform
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our comprehensive healthcare management system brings together all the tools 
                  you need for efficient medical care and administration.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {features.map((feature, index) => (
                  <div
                    key={feature}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooter;