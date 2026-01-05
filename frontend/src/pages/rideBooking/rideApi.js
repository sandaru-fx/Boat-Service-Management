// API service for boat ride booking operations
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Create new boat ride booking
export const createBoatRide = async (rideData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rideData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create ride booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating boat ride:', error);
    throw error;
  }
};

// Get customer's ride bookings
export const getMyRides = async (status = null, page = 1, limit = 10) => {
  try {
    let url = `${API_BASE_URL}/api/boat-rides/my-bookings?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch ride bookings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching my rides:', error);
    throw error;
  }
};

// Get ride booking by ID
export const getRideById = async (rideId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/${rideId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch ride booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ride by ID:', error);
    throw error;
  }
};

// Update ride booking
export const updateRide = async (rideId, rideData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/${rideId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(rideData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update ride booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating ride:', error);
    throw error;
  }
};

// Cancel ride booking
export const cancelRide = async (rideId, reason = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/${rideId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel ride booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling ride:', error);
    throw error;
  }
};

// Get all ride bookings (admin/employee only)
export const getAllRides = async (status = null, date = null, page = 1, limit = 10) => {
  try {
    let url = `${API_BASE_URL}/api/boat-rides/all?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    if (date) {
      url += `&date=${date}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch all ride bookings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all rides:', error);
    throw error;
  }
};

// Assign boat and captain (admin/employee only)
export const assignBoatAndCaptain = async (rideId, assignmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/${rideId}/assign`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to assign boat and captain');
    }

    return await response.json();
  } catch (error) {
    console.error('Error assigning boat and captain:', error);
    throw error;
  }
};

// Update ride status (admin/employee only)
export const updateRideStatus = async (rideId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/${rideId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update ride status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating ride status:', error);
    throw error;
  }
};

// Process refund (admin/employee only)
export const processRefund = async (rideId, refundData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/${rideId}/refund`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(refundData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process refund');
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

// Get ride booking by booking ID (for confirmation page)
export const getRideByBookingId = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/booking/${bookingId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch ride booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ride by booking ID:', error);
    throw error;
  }
};

// Generate PDF confirmation
export const generateRidePDFConfirmation = async (rideId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/${rideId}/pdf`, {
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

// Check availability for a specific date and time
export const checkAvailability = async (date, time, boatType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/availability`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date, time, boatType })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check availability');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

// Get pricing information
export const getPricing = async (boatType, journeyType, duration, passengers) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-rides/pricing`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ boatType, journeyType, duration, passengers })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get pricing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting pricing:', error);
    throw error;
  }
};
