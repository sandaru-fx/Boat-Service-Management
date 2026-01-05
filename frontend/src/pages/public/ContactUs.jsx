import React, { useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const ContactUs = () => {
  useEffect(() => {
    // Load Typeform embed script
    const script = document.createElement('script');
    script.src = '//embed.typeform.com/next/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Get in touch with our team. We're here to answer your questions and help with all your marine service needs.
          </p>
        </div>
      </div>

      {/* Contact Information & Form */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaMapMarkerAlt className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
                    <p className="text-gray-600">
                      Marina Bay, Port City<br />
                      Colombo, Sri Lanka
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaPhone className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
                    <p className="text-gray-600">
                      Main: +94 11 234 5678<br />
                      Emergency: +94 11 234 5679
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaEnvelope className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600">
                      General: info@marineservice.com<br />
                      Support: support@marineservice.com<br />
                      Sales: sales@marineservice.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaClock className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 4:00 PM<br />
                      Sunday: Closed<br />
                      <span className="text-sm text-gray-500">Emergency services available 24/7</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8">
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <p className="text-gray-500">Interactive Map Coming Soon</p>
                </div>
              </div>
            </div>

            {/* Typeform Contact Form */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                
                {/* Typeform Embed */}
                <div 
                  data-tf-live="01K6FH2DQKWJS47MZGTAQKSX4Z"
                  style={{width: '100%', height: '500px'}}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about our services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does a typical repair take?</h3>
              <p className="text-gray-600">
                Most routine maintenance can be completed within 1-2 days, while major repairs may take 1-2 weeks depending on parts availability.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer emergency services?</h3>
              <p className="text-gray-600">
                Yes, we provide 24/7 emergency services for urgent repairs and towing assistance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of boats do you service?</h3>
              <p className="text-gray-600">
                We service all types of boats including speedboats, yachts, fishing boats, and personal watercraft.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you provide warranties on your work?</h3>
              <p className="text-gray-600">
                Yes, all our repair work comes with a comprehensive warranty. Terms vary by service type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
