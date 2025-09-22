import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Phone, 
  Mail, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Clock,
  Shield,
  Award,
  Globe,
  Smartphone,
  ChevronUp
} from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { name: 'About Us', href: '#about' },
        { name: 'Our Services', href: '#services' },
        { name: 'Book Appointment', href: '/register' },
        { name: 'Find Doctors', href: '/doctors' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Contact Us', href: '#contact' }
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'Appointments', href: '/appointments' },
        { name: 'Patient Management', href: '/patients' },
        { name: 'Doctor Services', href: '/doctors' },
        { name: 'Billing', href: '/billing' },
        { name: 'Reports', href: '/reports' },
        { name: 'Inventory', href: '/inventory' }
      ]
    },
    {
      title: 'Patient Resources',
      links: [
        { name: 'Login', href: '/login' },
        { name: 'Register', href: '/register' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Appointments', href: '/appointments' },
        { name: 'Notifications', href: '/notifications' },
        { name: 'Settings', href: '/settings' }
      ]
    },
    {
      title: 'For Healthcare Providers',
      links: [
        { name: 'Doctor Dashboard', href: '/doctor/dashboard' },
        { name: 'Doctor Schedule', href: '/doctor/schedule' },
        { name: 'Staff Management', href: '/staff' },
        { name: 'Doctor Profile', href: '/doctor/profile' },
        { name: 'Communications', href: '/communications' },
        { name: 'Performance', href: '/doctor/performance' }
      ]
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Emergency Hotline',
      info: '+1 (555) 911-HELP',
      subtitle: '24/7 Emergency Services'
    },
    {
      icon: Phone,
      title: 'General Inquiries',
      info: '+1 (555) 123-MEDICARE',
      subtitle: 'Mon-Fri, 8 AM - 8 PM'
    },
    {
      icon: Mail,
      title: 'Email Support',
      info: 'support@medicarepro.health',
      subtitle: 'Response within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Main Office',
      info: '123 Healthcare Blvd, Medical District',
      subtitle: 'New York, NY 10001'
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-500' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
    { icon: Youtube, href: '#', color: 'hover:text-red-600' }
  ];

  const certifications = [
    { icon: Shield, text: 'HIPAA Compliant' },
    { icon: Award, text: 'ISO 27001 Certified' },
    { icon: Globe, text: 'GDPR Compliant' },
    { icon: Heart, text: 'FDA Approved' }
  ];

  return (
    <footer className="bg-gray-900 text-white relative">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
      >
        <ChevronUp className="w-6 h-6 text-white" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="pt-16 pb-12">
          <div className="grid lg:grid-cols-6 gap-12">
            
            {/* Company Info - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Medicare Pro
                  </h3>
                  <p className="text-gray-400 text-sm">Doctor Appointment & Management System</p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">
                Revolutionizing healthcare through innovative digital solutions. 
                We're committed to making quality healthcare accessible, efficient, 
                and patient-centered for everyone.
              </p>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">Certifications</h4>
                <div className="grid grid-cols-2 gap-2">
                  {certifications.map((cert, index) => {
                    const Icon = cert.icon;
                    return (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                        <Icon className="w-4 h-4 text-green-400" />
                        <span>{cert.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Links - Takes 4 columns */}
            <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
              {footerSections.map((section, sectionIndex) => (
                <div key={section.title} className="space-y-4">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.href}
                          className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                        >
                          <span>{link.name}</span>
                          <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-400 text-sm">
              <p>&copy; 2025 Medicare Pro. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  Privacy Policy
                </span>
                <span>|</span>
                <span className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  Terms of Service
                </span>
                <span>|</span>
                <span className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  Cookie Policy
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4" />
                <span>Mobile App Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;