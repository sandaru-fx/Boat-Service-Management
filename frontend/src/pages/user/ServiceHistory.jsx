import React from 'react';

const ServiceHistory = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Service History</h1>
          <p className="text-gray-600 mb-8">
            View your past services and maintenance records.
          </p>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <p className="text-pink-800">
              <strong>Coming Soon:</strong> Complete service history with detailed records and documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHistory;
