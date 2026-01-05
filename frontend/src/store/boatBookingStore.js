import { create } from "zustand";

export const useBoatBookingStore = create((set, get) => ({
	// State
	bookings: [],
	loading: false,
	error: null,
	selectedBooking: null,
	dashboardData: null,

	// Actions
	setBookings: (bookings) => set({ bookings }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setSelectedBooking: (selectedBooking) => set({ selectedBooking }),
	setDashboardData: (dashboardData) => set({ dashboardData }),

	// Fetch all bookings
	fetchBookings: async () => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-bookings`);
			const data = await response.json();
			
			if (data.success) {
				set({ bookings: data.data, loading: false });
			} else {
				set({ error: data.message, loading: false });
			}
		} catch (error) {
			set({ error: 'Failed to fetch bookings', loading: false });
		}
	},

	// Create new booking
	createBooking: async (bookingData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-bookings`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify(bookingData),
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({ 
					bookings: [...state.bookings, data.data], 
					loading: false 
				}));
				return { success: true, message: data.message, data: data.data };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to create booking', loading: false });
			return { success: false, message: 'Failed to create booking' };
		}
	},

	// Update booking
	updateBooking: async (id, bookingData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-bookings/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(bookingData),
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({
					bookings: state.bookings.map((booking) => 
						booking._id === id ? data.data : booking
					),
					loading: false
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to update booking', loading: false });
			return { success: false, message: 'Failed to update booking' };
		}
	},

	// Delete booking
	deleteBooking: async (id) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-bookings/${id}`, {
				method: 'DELETE',
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({
					bookings: state.bookings.filter((booking) => booking._id !== id),
					loading: false
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to delete booking', loading: false });
			return { success: false, message: 'Failed to delete booking' };
		}
	},

	// Employee Dashboard
	fetchEmployeeDashboard: async () => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-bookings/employee/dashboard`);
			const data = await response.json();
			
			if (data.success) {
				set({ dashboardData: data.data, loading: false });
				return { success: true, data: data.data };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to fetch dashboard data', loading: false });
			return { success: false, message: 'Failed to fetch dashboard data' };
		}
	},

	// Update booking status
	updateBookingStatus: async (id, statusData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-bookings/employee/bookings/${id}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(statusData),
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({
					bookings: state.bookings.map((booking) => 
						booking._id === id ? data.data : booking
					),
					loading: false
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to update booking status', loading: false });
			return { success: false, message: 'Failed to update booking status' };
		}
	},

	// Get bookings by status
	fetchBookingsByStatus: async (status) => {
		set({ loading: true, error: null });
		try {
			const url = status 
				? `/api/boat-bookings/employee/bookings?status=${status}`
				: '/api/boat-bookings/employee/bookings';
			
			const response = await fetch(url);
			const data = await response.json();
			
			if (data.success) {
				set({ bookings: data.data, loading: false });
			} else {
				set({ error: data.message, loading: false });
			}
		} catch (error) {
			set({ error: 'Failed to fetch bookings by status', loading: false });
		}
	},

	// Get flagged bookings
	fetchFlaggedBookings: async () => {
		set({ loading: true, error: null });
		try {
			const response = await fetch('/api/boat-bookings/employee/flagged');
			const data = await response.json();
			
			if (data.success) {
				set({ bookings: data.data.flaggedBookings, loading: false });
				return { success: true, data: data.data };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to fetch flagged bookings', loading: false });
			return { success: false, message: 'Failed to fetch flagged bookings' };
		}
	},

	// Send terms to customer
	sendTermsToCustomer: async (id, reason, customMessage) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-bookings/employee/bookings/${id}/terms`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ reason, customMessage }),
			});
			
			const data = await response.json();
			
			if (data.success) {
				set({ loading: false });
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to send terms', loading: false });
			return { success: false, message: 'Failed to send terms' };
		}
	},

	// Review booking content
	reviewBookingContent: async (id, action, employeeNotes, sendTerms) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-bookings/employee/bookings/${id}/review`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ action, employeeNotes, sendTerms }),
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({
					bookings: state.bookings.map((booking) => 
						booking._id === id ? data.data : booking
					),
					loading: false
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to review booking content', loading: false });
			return { success: false, message: 'Failed to review booking content' };
		}
	},

	// Search bookings
	searchBookings: async (query) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-bookings/search?q=${encodeURIComponent(query)}`);
			const data = await response.json();
			
			if (data.success) {
				set({ bookings: data.data, loading: false });
			} else {
				set({ error: data.message, loading: false });
			}
		} catch (error) {
			set({ error: 'Search failed', loading: false });
		}
	},

	// Clear error
	clearError: () => set({ error: null }),
}));
