import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShip, FaTools, FaCar, FaShoppingCart } from 'react-icons/fa';

const Home = () => {
  const { user, testLogin } = useAuth();
  const navigate = useNavigate();

  const mainServices = [
    {
      name: 'Boat Rides',
      description: 'Book exciting boat rides and water adventures',
      icon: <FaShip />,
      color: 'bg-blue-500',
      route: '/boat-rides'
    },
    {
      name: 'Repair Services',
      description: 'Professional boat repair and maintenance services',
      icon: <FaTools />,
      color: 'bg-orange-500',
      route: '/repair-service'
    },
    {
      name: 'Boat Purchase',
      description: 'Explore and purchase new boats with expert guidance',
      icon: <FaCar />,
      color: 'bg-green-500',
      route: '/boat-purchase'
    },
    {
      name: 'Spare Parts',
      description: 'Browse and buy boat spare parts and accessories',
      icon: <FaShoppingCart />,
      color: 'bg-purple-500',
      route: '/spare-parts'
    }
  ];

  const handleServiceClick = (route) => {
    if (user) {
      navigate(route);
    } else {
      navigate('/login', { state: { from: { pathname: route } } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Professional Boat Services
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your trusted partner for boat repair, maintenance, rides, and sales. 
              Experience the best in marine services.
            </p>
            <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 md:py-4 md:text-lg md:px-10"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-6 py-2 border-2 border-teal-600 text-sm font-medium rounded-lg text-teal-600 bg-white hover:bg-teal-50 hover:border-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose from our comprehensive range of boat services
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {mainServices.map((service, index) => (
              <div
                key={index}
                onClick={() => handleServiceClick(service.route)}
                className="relative group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center">
                    <div className={`${service.color} text-white p-4 rounded-lg mr-6 group-hover:scale-110 transition-transform duration-200`}>
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="mt-2 text-gray-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Professional service with years of experience
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-teal-600 font-bold text-xl">24/7</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">24/7 Support</h3>
              <p className="mt-2 text-gray-600">
                Round-the-clock customer support for all your boat service needs
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-teal-600 font-bold text-xl">✓</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Certified Technicians</h3>
              <p className="mt-2 text-gray-600">
                Our team consists of certified and experienced marine technicians
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-teal-600 font-bold text-xl">⚡</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Quick Service</h3>
              <p className="mt-2 text-gray-600">
                Fast and efficient service delivery to get you back on the water
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
