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

  const ctaButtons = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule your consultation with our expert doctors',
      action: () => navigate('/register'),
      color: 'blue',
      primary: true
    },
    {
      icon: Phone,
      title: 'Emergency Care',
      description: '24/7 emergency medical assistance',
      action: () => window.open('tel:+15559111234'),
      color: 'red'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant support from our team',
      action: () => {},
      color: 'green'
    },
    {
      icon: Download,
      title: 'Download App',
      description: 'Get our mobile app for better experience',
      action: () => {},
      color: 'purple'
    }
  ];

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
        
        {/* Main CTA Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            <span>Ready to Get Started?</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Take Control of Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Health Journey
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Join thousands of patients who trust DAMS for their healthcare needs. 
            Experience the future of medical care with our comprehensive digital platform.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{item.stat}</div>
                  <div className="text-blue-600 font-semibold mb-2">{item.label}</div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {ctaButtons.map((button, index) => {
            const Icon = button.icon;
            const colorClasses = getColorClasses(button.color, button.primary);
            
            return (
              <button
                key={button.title}
                onClick={button.action}
                className={`group p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 text-left ${colorClasses}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${button.primary ? 'bg-white/20' : 'bg-white'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${button.primary ? 'text-white' : `text-${button.color}-600`}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-2 ${button.primary ? 'text-white' : 'text-gray-900'}`}>
                      {button.title}
                    </h3>
                    <p className={`text-sm ${button.primary ? 'text-blue-100' : 'text-gray-600'} leading-relaxed`}>
                      {button.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-3">
                      <span className={`text-sm font-medium ${button.primary ? 'text-white' : `text-${button.color}-600`}`}>
                        Get Started
                      </span>
                      <ArrowRight className={`w-4 h-4 ${button.primary ? 'text-white' : `text-${button.color}-600`} group-hover:translate-x-1 transition-transform duration-300`} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Features Highlight */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-6">
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

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Start Free Trial</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-300">
                  <MessageCircle className="w-5 h-5" />
                  <span>Contact Sales</span>
                </button>
              </div>
            </div>

            {/* Right Content - App Showcase */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 h-96 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="flex justify-center space-x-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg animate-float">
                      <Smartphone className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                      <Globe className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-gray-800">Multi-Platform Access</h4>
                    <p className="text-gray-600">Available on web, iOS, and Android</p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Download for iOS
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Get it on Android
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooter;