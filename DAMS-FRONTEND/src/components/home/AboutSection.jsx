import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Heart, 
  Shield, 
  Clock, 
  Zap,
  CheckCircle,
  ArrowRight,
  Activity,
  Calendar,
  FileText,
  Stethoscope,
  Building,
  UserCheck
} from 'lucide-react';

const AboutSection = () => {
  const [activeTab, setActiveTab] = useState('mission');

  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered appointment scheduling that optimizes doctor availability and patient preferences.',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'HIPAA-compliant platform ensuring your medical data is always protected and confidential.',
      color: 'green'
    },
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Live health monitoring and instant alerts for critical medical conditions.',
      color: 'red'
    },
    {
      icon: Users,
      title: 'Multi-user Access',
      description: 'Seamless access for patients, doctors, and administrative staff with role-based permissions.',
      color: 'purple'
    },
    {
      icon: FileText,
      title: 'Digital Records',
      description: 'Complete digitization of medical records with easy access and comprehensive history.',
      color: 'orange'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Quick lab results, instant prescriptions, and immediate medical consultations.',
      color: 'yellow'
    }
  ];

  const stats = [
    { number: '1k', label: 'Active Patients', icon: Users },
    { number: '22', label: 'Medical Professionals', icon: UserCheck },
    { number: '15+', label: 'Hospital Partners', icon: Building },
    { number: '99.9%', label: 'System Uptime', icon: Activity }
  ];

  const tabContent = {
    mission: {
      title: 'Our Mission',
      content: 'To revolutionize healthcare delivery by providing a comprehensive digital platform that connects patients with healthcare providers seamlessly. We believe in making quality healthcare accessible, efficient, and patient-centered.',
      points: [
        'Democratize access to healthcare services',
        'Reduce waiting times and improve efficiency',
        'Enhance patient-doctor communication',
        'Streamline administrative processes'
      ]
    },
    vision: {
      title: 'Our Vision',
      content: 'To become the leading healthcare management platform that transforms how medical services are delivered, making healthcare more accessible, affordable, and effective for everyone.',
      points: [
        'Global healthcare accessibility',
        'AI-powered medical insights',
        'Preventive care focus',
        'Sustainable healthcare solutions'
      ]
    },
    values: {
      title: 'Our Values',
      content: 'We are guided by core values that ensure we deliver the highest quality service while maintaining the trust and confidence of our users.',
      points: [
        'Patient-first approach',
        'Data privacy and security',
        'Continuous innovation',
        'Collaborative healthcare'
      ]
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
      green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
      red: 'from-red-500 to-red-600 text-red-600 bg-red-50',
      purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
      orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50'
    };
    return colors[color];
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        {/* <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            <span>About DAMS</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Transforming Healthcare
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Through Technology
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            DAMS (Doctor Appointment & Management System) is a comprehensive healthcare platform 
            designed to streamline medical services and improve patient care through innovative technology.
          </p>
        </div> */}

        {/* Mission, Vision, Values Tabs */}
        <div className="mb-20">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              {Object.keys(tabContent).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tabContent[tab].title}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {tabContent[activeTab].title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {tabContent[activeTab].content}
                  </p>
                  <div className="space-y-3">
                    {tabContent[activeTab].points.map((point, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto">
                        <Stethoscope className="w-12 h-12 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">{tabContent[activeTab].title}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h3>
            <p className="text-lg text-gray-600">
              Numbers that reflect our commitment to excellence in healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;