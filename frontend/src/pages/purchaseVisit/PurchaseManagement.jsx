import React from 'react';

const PurchaseManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Purchase Management</h1>
          <p className="text-gray-600 mb-8">
            Manage boat purchase visits, assign sales reps, and follow up with customers.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              <strong>Coming Soon:</strong> Complete purchase management system with sales rep assignment and follow-up tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManagement;
