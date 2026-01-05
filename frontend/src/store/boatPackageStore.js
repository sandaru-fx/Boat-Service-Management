import { create } from "zustand";

export const useBoatPackageStore = create((set, get) => ({
	// State
	packages: [],
	loading: false,
	error: null,
	selectedPackage: null,

	// Actions
	setPackages: (packages) => set({ packages }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setSelectedPackage: (selectedPackage) => set({ selectedPackage }),

	// Fetch all packages (Employee view)
	fetchPackages: async () => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-packages`);
			const data = await response.json();
			
			if (data.success) {
				set({ packages: data.data, loading: false });
			} else {
				set({ error: data.message, loading: false });
			}
		} catch (error) {
			set({ error: 'Failed to fetch packages', loading: false });
		}
	},

	// Fetch active packages (Customer view)
	fetchActivePackages: async () => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-packages/active`);
			const data = await response.json();
			
			if (data.success) {
				set({ packages: data.data, loading: false });
			} else {
				set({ error: data.message, loading: false });
			}
		} catch (error) {
			set({ error: 'Failed to fetch active packages', loading: false });
		}
	},

	// Create new package
	createPackage: async (packageData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-packages`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify(packageData),
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({ 
					packages: [...state.packages, data.data], 
					loading: false 
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to create package', loading: false });
			return { success: false, message: 'Failed to create package' };
		}
	},

	// Update package
	updatePackage: async (id, packageData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-packages/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify(packageData),
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({
					packages: state.packages.map((pkg) => 
						pkg._id === id ? data.data : pkg
					),
					loading: false
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to update package', loading: false });
			return { success: false, message: 'Failed to update package' };
		}
	},

	// Delete package
	deletePackage: async (id) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-packages/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({
					packages: state.packages.filter((pkg) => pkg._id !== id),
					loading: false
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to delete package', loading: false });
			return { success: false, message: 'Failed to delete package' };
		}
	},

	// Toggle package status
	togglePackageStatus: async (id) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-packages/${id}/toggle`, {
				method: 'PATCH',
			});
			
			const data = await response.json();
			
			if (data.success) {
				set((state) => ({
					packages: state.packages.map((pkg) => 
						pkg._id === id ? data.data : pkg
					),
					loading: false
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to toggle package status', loading: false });
			return { success: false, message: 'Failed to toggle package status' };
		}
	},

	// Get package by ID
	fetchPackageById: async (id) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-packages/${id}`);
			const data = await response.json();
			
			if (data.success) {
				set({ selectedPackage: data.data, loading: false });
				return { success: true, data: data.data };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: 'Failed to fetch package', loading: false });
			return { success: false, message: 'Failed to fetch package' };
		}
	},

	// Search packages
	searchPackages: async (query) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/boat-packages/search?q=${encodeURIComponent(query)}`);
			const data = await response.json();
			
			if (data.success) {
				set({ packages: data.data, loading: false });
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
