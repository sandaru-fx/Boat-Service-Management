import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaWrench, FaShip, FaShoppingCart, FaTools, FaCheckCircle, FaClock, FaShieldAlt, FaUsers, FaPhone, FaEnvelope } from 'react-icons/fa';

const ServiceInfo = () => {
  const { serviceType } = useParams(); // Get service type from URL params

  const services = {
    'boat-repairs': {
      title: 'Boat Repairs & Maintenance',
      icon: <FaWrench className="text-4xl text-teal-600" />,
      description: 'Professional boat repair and maintenance services to keep your vessel in top condition.',
      pricing: 'Starting from LKR 25,000',
      features: [
        'Engine diagnostics and repair',
        'Hull and fiberglass work',
        'Electrical system maintenance',
        'Propeller and drive system service',
        'Winterization and storage',
        'Emergency repair services',
        'Preventive maintenance programs'
      ],
      process: [
        'Contact us to schedule an inspection',
        'We assess your boat\'s condition',
        'Receive a detailed quote and timeline',
        'Work begins with regular updates',
        'Quality check and testing',
        'Final delivery and documentation'
      ],
      benefits: [
        'Certified marine technicians',
        'Quality parts and materials',
        'Comprehensive warranty',
        'Emergency support available',
        'Transparent pricing'
      ],
      ctaText: 'Book Repair Service',
      ctaLink: '/repair-service'
    },
    'boat-rides': {
      title: 'Boat Rides & Charters',
      icon: <FaShip className="text-4xl text-teal-600" />,
      description: 'Experience the beauty of Sri Lankan waters with our professional boat ride and charter services.',
      pricing: 'Starting from LKR 12,000/hour',
      features: [
        'Scenic coastal tours',
        'Fishing charters',
        'Sunset cruises',
        'Private group bookings',
        'Professional captain service',
        'Safety equipment included',
        'Customized itineraries'
      ],
      process: [
        'Choose your preferred ride type',
        'Select date and time',
        'Provide passenger details',
        'Make payment confirmation',
        'Arrive at designated location',
        'Enjoy your boat ride experience'
      ],
      benefits: [
        'Experienced captains',
        'Well-maintained boats',
        'Safety first approach',
        'Flexible scheduling',
        'Group discounts available'
      ],
      ctaText: 'Book Boat Ride',
      ctaLink: '/boat-rides'
    },
    'spare-parts': {
      title: 'Spare Parts & Accessories',
      icon: <FaShoppingCart className="text-4xl text-teal-600" />,
      description: 'Quality marine spare parts and accessories for all your boat maintenance and upgrade needs.',
      pricing: 'Contact for pricing',
      features: [
        'Original equipment parts',
        'Aftermarket alternatives',
        'Engine components',
        'Electrical parts',
        'Safety equipment',
        'Navigation accessories',
        'Comfort and convenience items'
      ],
      process: [
        'Browse our online catalog',
        'Search by boat make/model',
        'Add items to cart',
        'Proceed to checkout',
        'Choose delivery or pickup',
        'Receive your order'
      ],
      benefits: [
        'Genuine parts guarantee',
        'Competitive pricing',
        'Fast delivery options',
        'Expert advice available',
        'Warranty on all parts'
      ],
      ctaText: 'Browse Spare Parts',
      ctaLink: '/spare-parts'
    },
    'boat-sales': {
      title: 'Boat Sales & Purchase',
      icon: <FaTools className="text-4xl text-teal-600" />,
      description: 'Find your perfect vessel with our extensive selection of new and pre-owned boats.',
      pricing: 'Contact for pricing',
      features: [
        'New boat sales',
        'Quality pre-owned vessels',
        'Trade-in evaluations',
        'Financing assistance',
        'Delivery and setup',
        'Warranty coverage',
        'After-sales support'
      ],
      process: [
        'Visit our showroom',
        'Explore available boats',
        'Take a test drive',
        'Discuss financing options',
        'Complete purchase process',
        'Arrange delivery/setup'
      ],
      benefits: [
        'Wide selection of boats',
        'Expert guidance',
        'Flexible financing',
        'Comprehensive warranty',
        'Ongoing support'
      ],
      ctaText: 'Visit Showroom',
      ctaLink: '/boat-purchase'
    }
  };

  const service = services[serviceType];

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <Link to="/services" className="text-teal-600 hover:text-teal-700">
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {service.icon}
            </div>
            <h1 className="text-4xl font-bold mb-4">{service.title}</h1>
            <p className="text-xl max-w-3xl mx-auto mb-6">{service.description}</p>
            <div className="text-2xl font-semibold">{service.pricing}</div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Features */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
                <ul className="space-y-4">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheckCircle className="text-teal-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Process & Benefits */}
            <div className="lg:col-span-2 space-y-8">
              {/* Process */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
                <div className="space-y-4">
                  {service.process.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-teal-100 text-teal-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <FaShieldAlt className="text-teal-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience our professional {service.title.toLowerCase()} services. Login to your account to book or browse our services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Login to {service.ctaText}
            </Link>
            <Link
              to="/contact"
              className="border-2 border-teal-600 text-teal-600 px-8 py-3 rounded-lg font-medium hover:bg-teal-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">Need More Information?</h3>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <div className="flex items-center">
                <FaPhone className="text-teal-400 mr-3" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-teal-400 mr-3" />
                <span>info@marineservice.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfo;
