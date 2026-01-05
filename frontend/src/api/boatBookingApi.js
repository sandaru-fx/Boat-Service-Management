// API service for boat booking operations
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get customer's own boat bookings
export const getMyBoatBookings = async (status = null, page = 1, limit = 10) => {
  try {
    let url = `${API_BASE_URL}/api/boat-bookings/my-bookings?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch boat bookings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching my boat bookings:', error);
    throw error;
  }
};

// Get boat booking by ID
export const getBoatBookingById = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-bookings/${bookingId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch boat booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching boat booking by ID:', error);
    throw error;
  }
};

// Update boat booking
export const updateBoatBooking = async (bookingId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-bookings/${bookingId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update boat booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating boat booking:', error);
    throw error;
  }
};

// Cancel boat booking
export const cancelBoatBooking = async (bookingId, reason = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-bookings/${bookingId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel boat booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling boat booking:', error);
    throw error;
  }
};

// Delete boat booking
export const deleteBoatBooking = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/boat-bookings/${bookingId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete boat booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting boat booking:', error);
    throw error;
  }
};
