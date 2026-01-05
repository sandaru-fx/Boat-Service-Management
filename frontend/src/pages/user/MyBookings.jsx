import React from 'react';

const MyBookings = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
          <p className="text-gray-600 mb-8">
            View and manage your upcoming bookings for rides, repairs, and purchases.
          </p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-indigo-800">
              <strong>Coming Soon:</strong> Comprehensive booking management with status updates and modifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
