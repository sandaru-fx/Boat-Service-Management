import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import { useProductStore } from "../../store/productStore";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedQty, setSelectedQty] = useState(1);
  
  // Use Zustand store
  const { products, loading, fetchProducts, getProductById } = useProductStore();
  
  // Get current product and all products from store
  const product = getProductById(id);
  const allProducts = products;

  useEffect(() => {
    // Fetch products if not already loaded
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const handleAddToCart = () => {
    if (!product) return;

    if (selectedQty <= 0 || selectedQty > product.quantity) {
      alert(`Please select a quantity between 1 and ${product.quantity}`);
      return;
    }

    //Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    //Check if product already exists in cart
    const existingIndex = cart.findIndex((p) => p._id === product._id);
    if (existingIndex >= 0) {
      cart[existingIndex].selectedQty += selectedQty;
    } else {
      cart.push({ ...product, selectedQty });
    }

    //Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    //Trigger storage event so Navbar updates instantly
    window.dispatchEvent(new Event("storage"));
    //Show success message
    alert(`${selectedQty} x ${product.name} added to your cart.`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (selectedQty <= 0 || selectedQty > product.quantity) {
      alert(`Please select a quantity between 1 and ${product.quantity}`);
      return;
    }

    // Create a temporary cart with just this product for Buy Now
    const buyNowItem = { ...product, selectedQty };
    const tempCart = [buyNowItem];
    
    // Save temporary cart to localStorage
    localStorage.setItem("cart", JSON.stringify(tempCart));
    
    // Trigger storage event so Navbar updates instantly
    window.dispatchEvent(new Event("storage"));
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  const handleSearchWeb = () => {
    if (!product || !product.partNumber) return;
    const query = encodeURIComponent(product.partNumber);
    const url = `https://www.google.com/search?q=${query} about`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb product={product} />

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image */}
            <div>
              <div className="h-96 bg-gray-200 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-500">No Image Available</span>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              {/* Product Name with Category Badge */}
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {product.category || "Uncategorized"}
                </span>
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-center">{product.description}</p>
                </div>
              )}

              {/* Search Web Button */}
              <div className="mb-6">
                <button
                  onClick={handleSearchWeb}
                  className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 hover:border-blue-400 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Web for More Info
                </button>
              </div>

              {/* Product Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium w-24">Part No:</span>
                  <span className="text-gray-900 font-semibold">{product.partNumber}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium w-24">Company:</span>
                  <span className="text-gray-900 font-semibold">{product.company}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium w-24">Available:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                    Number(product.quantity) < 10 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.quantity} in stock
                  </span>
                </div>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Rs. {product.price.toLocaleString()}
                </div>
                <div className="text-green-600 font-medium">
                  ✓ In Stock ({product.quantity} available)
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <label className="mr-4 font-medium">Select Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300"
                    disabled={product.quantity === 0}
                  >
                    {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors duration-300"
                    disabled={product.quantity === 0}
                  >
                    {product.quantity > 0 ? "Buy Now" : "Out of Stock"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Security Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Shipping */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Free Shipping</h3>
                <p className="text-gray-600 text-sm">
                  Free shipping on all orders over $149. We ship worldwide with express options for all orders.
                </p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Secure & Safe Payment</h3>
                <p className="text-gray-600 text-sm">
                  We guarantee the security of all transactions. We also offer financing options with PayPal Pay Later.
                </p>
              </div>
            </div>

            {/* Return Policy */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Return within 90 days</h3>
                <p className="text-gray-600 text-sm">
                  We accept returns within 90 days of receipt. Please see our return page for full return policy details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {allProducts.length > 1 && (
          <div className="mt-8">
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allProducts
                  .filter((p) => p._id !== product._id && (p.category || "") === (product.category || ""))
                  .slice(0, 8)
                  .map((relatedProduct) => (
                    <div 
                      key={relatedProduct._id} 
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => navigate(`/spare-parts/${relatedProduct._id}`)}
                    >
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {relatedProduct.image ? (
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500">No Image</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-1">Part No: {relatedProduct.partNumber}</p>
                        <p className="text-gray-600 text-sm mb-1">Company: {relatedProduct.company}</p>
                        <p className="text-gray-600 text-sm mb-1">
                          Available: 
                          <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            Number(relatedProduct.quantity) < 10 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {relatedProduct.quantity}
                          </span>
                        </p>
                        <p className="text-blue-600 font-bold text-lg">Rs. {relatedProduct.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
