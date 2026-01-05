// API service for boat repair operations
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Token exists' : 'No token');
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
  console.log('API Base URL:', API_BASE_URL);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Create new boat repair request
export const createBoatRepair = async (repairData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-repairs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(repairData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create repair request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating boat repair:', error);
    throw error;
  }
};

// Get repair by booking ID
export const getRepairByBookingId = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-repairs/booking/${bookingId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch repair request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching repair by booking ID:', error);
    throw error;
  }
};

// Get repair by ID
export const getRepairById = async (repairId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-repairs/${repairId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch repair request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching repair by ID:', error);
    throw error;
  }
};

// Get customer's repair requests
export const getMyRepairs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-repairs/my-repairs`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch repair requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching my repairs:', error);
    throw error;
  }
};

// Update repair request (customer edit)
export const updateRepairByCustomer = async (repairId, repairData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-repairs/${repairId}/customer-edit`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(repairData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update repair request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating repair request:', error);
    throw error;
  }
};

// Cancel repair request (customer)
export const cancelRepairByCustomer = async (repairId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-repairs/${repairId}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel repair request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling repair request:', error);
    throw error;
  }
};

// Delete repair request (customer)
export const deleteRepairByCustomer = async (repairId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-repairs/${repairId}/customer-delete`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete repair request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting repair:', error);
    throw error;
  }
};

// Generate PDF confirmation
export const generatePDFConfirmation = async (repairId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-repairs/${repairId}/pdf`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate PDF');
    }

    // Return the blob for download
    return await response.blob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
