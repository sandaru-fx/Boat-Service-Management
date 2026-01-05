import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./ShopCategory.css";

const ShopCategory = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // selected category
  const [categories, setCategories] = useState([]); // list of unique categories
  const [searchQuery, setSearchQuery] = useState(""); // search query
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(); // fetch all products from backend
  }, []);

  useEffect(() => {
    // Extract unique categories from products
    const uniqueCategories = [
      ...new Set(products.map((p) => p.category || "Uncategorized")),
    ];
    setCategories(uniqueCategories);
  }, [products]);

  const fetchProducts = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on selected category and search query
  const filteredProducts = React.useMemo(() => {
    const byCategory = selectedCategory === "" || selectedCategory === "All"
      ? products
      : products.filter(
          (p) => (p.category || "Uncategorized") === selectedCategory
        );
    
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byCategory;
    
    return byCategory.filter((p) =>
      (p.name || "").toLowerCase().includes(q) || 
      (p.partNumber || "").toLowerCase().includes(q)
    );
  }, [products, selectedCategory, searchQuery]);

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Boat Spare Parts</h1>
              <p className="text-gray-600">Find the parts you need for your boat</p>
            </div>
            <Link 
              to="/dashboard" 
              className="dashboard-link"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              <span className="font-semibold">Showing {filteredProducts.length}</span> products
            </p>

            {/* Search and Category Selection */}
            {categories.length > 0 && (
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search by name or part number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ minWidth: "260px" }}
                />
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link key={product._id} to={`/spare-parts/${product._id}`} className="block">
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                    <p className="text-gray-600 text-sm mb-1">Available: {product.quantity}</p>
                    <p className="text-gray-600 text-sm mb-2">Category: {product.category || "Uncategorized"}</p>
                    <p className="text-blue-600 font-bold text-lg">Rs. {product.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No products available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopCategory;
