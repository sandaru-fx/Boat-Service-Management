import React from 'react';

const PaymentHistory = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment History</h1>
          <p className="text-gray-600 mb-8">
            View your payment history and invoices.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>Coming Soon:</strong> Complete payment history with invoices and transaction details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
