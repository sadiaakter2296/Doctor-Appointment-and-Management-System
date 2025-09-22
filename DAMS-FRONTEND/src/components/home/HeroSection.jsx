import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  Shield, 
  Activity,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Phone
} from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { number: '500+', label: 'Patients Served', icon: Users },
    { number: '22+', label: 'Qualified Doctors', icon: Activity },
    { number: '99.9%', label: 'Uptime Reliability', icon: Shield },
    { number: '24/7', label: 'Emergency Support', icon: Clock }
  ];

  const features = [
    'Easy Appointment Booking',
    'Real-time Doctor Availability',
    'Secure Medical Records',
    'Instant Prescription Access',
    'Emergency Care Support'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium animate-bounce-in">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Trusted by 500+ Patients</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Health,
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Experience seamless healthcare management with our comprehensive digital platform. 
                Book appointments, consult doctors, and manage your health records all in one place.
              </p>

              {/* Features List */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div 
                    key={feature}
                    className="flex items-center space-x-3 animate-slide-in-right"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/register')}
                className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

             
            </div>

            {/* Emergency Contact */}
            <div className="flex items-center space-x-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-red-800 font-semibold">Emergency? Call Now</p>
                <p className="text-red-600 text-lg font-bold">+088 0188-3844096</p>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Only (removed Digital Healthcare card) */}
          <div className="space-y-8">
            {/* Animated Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`p-6 rounded-2xl transition-all duration-500 ${
                      currentStat === index
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl scale-105'
                        : 'bg-white text-gray-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-8 h-8 ${currentStat === index ? 'text-white' : 'text-blue-600'}`} />
                      <div>
                        <div className="text-2xl font-bold">{stat.number}</div>
                        <div className={`text-sm ${currentStat === index ? 'text-blue-100' : 'text-gray-500'}`}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;