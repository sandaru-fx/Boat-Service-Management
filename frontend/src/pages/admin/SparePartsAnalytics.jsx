import React from 'react';
import { FaArrowLeft, FaWrench, FaChartPie, FaBox, FaShoppingBag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SparePartsAnalytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Spare Parts Analytics</h1>
          </div>
          <p className="text-gray-600">Spare parts inventory and sales insights</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl text-orange-500 mb-6">
              <FaWrench />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              Spare parts analytics will provide insights into inventory management, 
              sales performance, popular parts, and stock optimization.
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <FaChartPie className="mr-2" />
                <span>Sales performance and trends</span>
              </div>
              <div className="flex items-center justify-center">
                <FaBox className="mr-2" />
                <span>Inventory management and stock levels</span>
              </div>
              <div className="flex items-center justify-center">
                <FaShoppingBag className="mr-2" />
                <span>Popular parts and customer preferences</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparePartsAnalytics;
