import { create } from "zustand";

export const useReviewsStore = create((set, get) => ({
  reviews: [],
  userEmail: null,

  setUserEmail: (email) => set({ userEmail: email }),

  // Test function to manually set reviews
  setReviews: (newReviews) => {
    console.log('Reviews Store: Manually setting reviews:', newReviews);
    set({ reviews: newReviews });
  },

  fetchReviews: async (boatId, userEmail = null, isAdmin = false) => {
    try {
      let url = boatId ? `${process.env.REACT_APP_API_URL}/api/reviews?boatId=${boatId}` : `${process.env.REACT_APP_API_URL}/api/reviews`;
      
      if (userEmail) {
        url += `&userEmail=${encodeURIComponent(userEmail)}`;
      }
      
      if (isAdmin) {
        url += `&admin=true`;
      }
      
      console.log('Reviews Store: Fetching from URL:', url);
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Reviews Store: Response:', data);
      
      if (!data.success) {
        console.error('Reviews Store: API returned success=false:', data.message);
        return;
      }
      
      console.log('Reviews Store: Setting reviews:', data.data);
      set({ reviews: data.data });
    } catch (e) {
      console.error("Reviews Store: Error fetching reviews", e);
    }
  },

  addReview: async (review) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      set((state) => ({ reviews: [data.data, ...state.reviews] }));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  deleteReview: async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      set((state) => ({ reviews: state.reviews.filter((r) => r._id !== id) }));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },
}));


