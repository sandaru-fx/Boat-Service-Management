import React from 'react';
import { Link } from 'react-router-dom';
import { FaShip, FaTools, FaWrench, FaShoppingCart, FaLifeRing, FaClock, FaCheckCircle } from 'react-icons/fa';

const Services = () => {
  const services = [
    {
      icon: <FaWrench className="text-3xl" />,
      title: "Boat Repairs",
      description: "Comprehensive repair services for all types of boats, from routine maintenance to major overhauls.",
      features: [
        "Engine diagnostics and repair",
        "Hull and fiberglass work",
        "Electrical system maintenance",
        "Propeller and drive system service",
        "Winterization and storage"
      ],
      price: "Starting from LKR 25,000",
      link: "/service-info/boat-repairs"
    },
    {
      icon: <FaShip className="text-3xl" />,
      title: "Boat Rides",
      description: "Experience the water with our professional boat ride services and scenic charters.",
      features: [
        "Scenic coastal tours",
        "Fishing charters",
        "Sunset cruises",
        "Private group bookings",
        "Professional captain service"
      ],
      price: "Starting from LKR 12,000/hour",
      link: "/service-info/boat-rides"
    },
    {
      icon: <FaShoppingCart className="text-3xl" />,
      title: "Spare Parts",
      description: "Quality marine spare parts and accessories for all your boat maintenance needs.",
      features: [
        "Original equipment parts",
        "Aftermarket alternatives",
        "Engine components",
        "Electrical parts",
        "Safety equipment"
      ],
      price: "Contact for pricing",
      link: "/service-info/spare-parts"
    },
    {
      icon: <FaTools className="text-3xl" />,
      title: "Boat Sales",
      description: "Find your perfect vessel with our extensive selection of new and pre-owned boats.",
      features: [
        "New boat sales",
        "Quality pre-owned vessels",
        "Trade-in evaluations",
        "Financing assistance",
        "Visit our showroom"
      ],
      price: "Contact for pricing",
      link: "/service-info/boat-sales"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Comprehensive marine services designed to keep you on the water. From repair and maintenance to rides and sales, we've got you covered.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mr-4">
                      <div className="text-teal-600">
                        {service.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                      <p className="text-teal-600 font-semibold">{service.price}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">What's Included:</h4>
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <FaCheckCircle className="text-teal-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <Link
                      to={service.link}
                      className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors font-medium inline-block text-center"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Marine Service Center?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're committed to providing exceptional service with the highest standards of quality and safety.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-teal-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Certified Technicians</h3>
              <p className="text-gray-600">
                Our team consists of certified marine technicians with years of experience and ongoing training.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FaClock className="text-teal-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Timely Service</h3>
              <p className="text-gray-600">
                We understand your time is valuable. We work efficiently to get you back on the water quickly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FaLifeRing className="text-teal-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Warranty & Support</h3>
              <p className="text-gray-600">
                All our services come with comprehensive warranties and ongoing support to ensure your satisfaction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your marine service needs. We're here to help you make the most of your time on the water.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-teal-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center"
            >
              Get a Quote
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-teal-600 transition-colors text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
