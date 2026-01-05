import { create } from "zustand";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  // Set products
  setProducts: (products) => set({ products, loading: false, error: null }),

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error state
  setError: (error) => set({ error, loading: false }),

  // Fetch all products
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      
      if (data.success) {
        set({ products: data.data, loading: false, error: null });
      } else {
        set({ error: data.message || 'Failed to fetch products', loading: false });
      }
    } catch (error) {
      set({ error: error.message || 'Network error', loading: false });
    }
  },

  // Create new product
  createProduct: async (newProduct) => {
    if (!newProduct.name || !newProduct.image || !newProduct.price || !newProduct.partNumber || !newProduct.company || !newProduct.quantity) {
      return { success: false, message: "Please fill in all fields." };
    }
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add new product to the store
        set((state) => ({ 
          products: [...state.products, data.data],
          error: null 
        }));
        return { success: true, message: "Product created successfully" };
      } else {
        return { success: false, message: data.message || "Failed to create product" };
      }
    } catch (error) {
      return { success: false, message: error.message || "Network error" };
    }
  },

  // Update product
  updateProduct: async (productId, updatedProduct) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update product in the store
        set((state) => ({
          products: state.products.map((product) => 
            product._id === productId ? data.data : product
          ),
          error: null
        }));
        return { success: true, message: "Product updated successfully" };
      } else {
        return { success: false, message: data.message || "Failed to update product" };
      }
    } catch (error) {
      return { success: false, message: error.message || "Network error" };
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove product from the store
        set((state) => ({
          products: state.products.filter((product) => product._id !== productId),
          error: null
        }));
        return { success: true, message: "Product deleted successfully" };
      } else {
        return { success: false, message: data.message || "Failed to delete product" };
      }
    } catch (error) {
      return { success: false, message: error.message || "Network error" };
    }
  },

  // Get product by ID
  getProductById: (productId) => {
    const { products } = get();
    return products.find((product) => product._id === productId) || null;
  },

  // Get products by category
  getProductsByCategory: (category) => {
    const { products } = get();
    return products.filter((product) => product.category === category);
  },

  // Search products
  searchProducts: (query) => {
    const { products } = get();
    const searchQuery = query.toLowerCase().trim();
    return products.filter((product) =>
      (product.name || "").toLowerCase().includes(searchQuery) ||
      (product.partNumber || "").toLowerCase().includes(searchQuery) ||
      (product.company || "").toLowerCase().includes(searchQuery)
    );
  },
}));
