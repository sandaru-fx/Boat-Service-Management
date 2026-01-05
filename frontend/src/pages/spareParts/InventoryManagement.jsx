import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./InventoryManagement.css";

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      console.log('🔍 Fetching products from:', `${API_BASE_URL}/api/products`);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      console.log('📡 Products response status:', response.status);
      const data = await response.json();
      console.log('📡 Products response data:', data);
      if (data.success) {
        console.log('✅ Products loaded:', data.data.length, 'items');
        setProducts(data.data);
      } else {
        console.error('❌ Products API returned error:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from products
  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...unique];
  }, [products]);

  // Detect low stock products (quantity < 10)
  const lowStockProducts = React.useMemo(() => 
    products.filter((p) => (Number(p.quantity) || 0) < 10), 
    [products]
  );

  // Filter products based on selected category and search query
  const filteredProducts = React.useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    
    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((p) =>
        (p.name || "").toLowerCase().includes(q) || 
        (p.partNumber || "").toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          alert('Product deleted successfully');
          fetchProducts(); // Refresh the list
        } else {
          alert('Error deleting product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
              <p className="text-gray-600">Manage boat spare parts inventory</p>
            </div>
            <Link 
              to="/employee/orders" 
              className="order-management-link"
            >
              📦 Order Management
            </Link>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Low Stock Alert - {lowStockProducts.length} item{lowStockProducts.length !== 1 ? 's' : ''} running low
                </h3>
                <div className="text-sm text-red-700">
                  <div className="space-y-1">
                    {lowStockProducts.map((product, index) => (
                      <div key={product._id} className="flex justify-between items-center bg-red-100 rounded px-2 py-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-red-600 font-semibold">Qty: {product.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter + Search + Actions Row */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name or part number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-64"
            />
            
            {/* Category Filter */}
            {categories.length > 1 && (
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-4">
            <Link to="/inventory/report">
              <button className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors duration-300 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </button>
            </Link>
            
            <Link to="/inventory/create">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Product
              </button>
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-1">Part No: {product.partNumber}</p>
                <p className="text-gray-600 text-sm mb-1">Company: {product.company}</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600 text-sm">Available:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    Number(product.quantity) < 10 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.quantity}
                    {Number(product.quantity) < 10 && (
                      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">Category: {product.category || "Uncategorized"}</p>
                <p className="text-blue-600 font-bold text-lg mb-4">Rs. {product.price.toLocaleString()}</p>

                <div className="flex space-x-2">
                  <Link
                    to={`/inventory/edit/${product._id}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No products found</p>
            <Link to="/inventory/create">
              <span className="text-blue-500 hover:underline">Create a product</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
