import React from 'react';
import { Link } from 'react-router-dom';
import { FaShip, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-teal-600 rounded-lg flex items-center justify-center mr-3">
                <FaShip className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold">Marine Service Center</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted partner for comprehensive marine services. We provide exceptional boat repair, maintenance, rides, and sales with over 15 years of experience.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-teal-400 transition-colors">
                <FaFacebook className="text-xl" />
              </button>
              <button className="text-gray-400 hover:text-teal-400 transition-colors">
                <FaTwitter className="text-xl" />
              </button>
              <button className="text-gray-400 hover:text-teal-400 transition-colors">
                <FaInstagram className="text-xl" />
              </button>
              <button className="text-gray-400 hover:text-teal-400 transition-colors">
                <FaLinkedin className="text-xl" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-teal-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-300">Boat Repair & Maintenance</span>
              </li>
              <li>
                <span className="text-gray-300">Boat Rides & Charters</span>
              </li>
              <li>
                <span className="text-gray-300">Boat Sales & Purchase</span>
              </li>
              <li>
                <span className="text-gray-300">Purchase Visits</span>
              </li>
              <li>
                <span className="text-gray-300">Emergency Services</span>
              </li>
              <li>
                <span className="text-gray-300">Winterization</span>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-teal-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Marina Bay, Port City<br />
                  Colombo, Sri Lanka
                </span>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-teal-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+94 11 234 5678</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-teal-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@marineservice.com</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Marine Service Center. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-teal-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-teal-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/support" className="text-gray-400 hover:text-teal-400 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
