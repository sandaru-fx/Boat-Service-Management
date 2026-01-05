import React from 'react';

const BoatPurchase = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Boat Purchase Visit</h1>
          <p className="text-gray-600 mb-8">
            Schedule a visit to explore and purchase new boats with expert guidance.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              <strong>Coming Soon:</strong> Interactive boat purchase visit booking with sales representative assignment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoatPurchase;
