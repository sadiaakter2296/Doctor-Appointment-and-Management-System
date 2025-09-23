import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Phone, 
  Mail, 
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  ArrowRight,
  Clock,
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
        { name: 'Home', href: '/' },
        { name: 'About', href: '#about' }
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
    { icon: Instagram, href: '#', color: 'hover:text-pink-500' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-700' }
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
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Company Info - Left Side */}
            <div className="space-y-6">
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
            </div>

            {/* Quick Links - Right Side */}
            <div className="flex justify-end">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {footerSections[0].links.map((link, linkIndex) => (
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
              
             
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;