import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    partNumber: "",
    company: "",
    category: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    image: "",
    partNumber: "",
    company: "",
    category: "",
    quantity: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    price: false,
    image: false,
    partNumber: false,
    company: false,
    category: false,
    quantity: false,
  });

  const categories = ["PowerHead", "Electronical", "Gearbox", "BracketUnit", "FuelSystem"];

  // Validation functions
  const validateName = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Product name is required";
    if (trimmed.length < 3) return "Product name must be at least 3 characters long";
    const nameRegex = /^[A-Za-z0-9\s\-&,./()]+$/;
    if (!nameRegex.test(trimmed)) return "Only letters, numbers, spaces, -, &, /, () are allowed";
    return "";
  };

  const validatePartNumber = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Part number is required";
    if (trimmed.length >= 20) return "Part number must be less than 20 characters";
    const partNumberRegex = /^[A-Za-z0-9\-\/]+$/;
    if (!partNumberRegex.test(trimmed)) return "Only letters, numbers, - and / allowed";
    return "";
  };

  const validatePrice = (value) => {
    if (!value) return "Price is required";
    const price = parseFloat(value);
    if (isNaN(price)) return "Price must be a valid number";
    if (price <= 0) return "Price must be greater than 0";
    return "";
  };

  const validateImageUrl = (value) => {
    if (!value) return ""; // Optional field
    const urlRegex = /^https?:\/\/.+/i;
    if (!urlRegex.test(value)) return "Image URL must be a valid HTTP/HTTPS link";
    return "";
  };

  const validateCompany = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Company name is required";
    const companyRegex = /^[A-Za-z\s.&]+$/;
    if (!companyRegex.test(trimmed)) return "Only letters, spaces, . and & allowed";
    return "";
  };

  const validateCategory = (value) => {
    if (!value) return "Please select a category";
    return "";
  };

  const validateQuantity = (value) => {
    if (!value) return "Quantity is required";
    const quantity = parseInt(value);
    if (isNaN(quantity)) return "Quantity must be a valid number";
    if (quantity <= 0) return "Quantity must be greater than 0";
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update product state
    setNewProduct({
      ...newProduct,
      [name]: value,
    });

    // Mark field as touched
    setTouched({ ...touched, [name]: true });

    // Validate field
    let error = "";
    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "partNumber":
        error = validatePartNumber(value);
        break;
      case "price":
        error = validatePrice(value);
        break;
      case "image":
        error = validateImageUrl(value);
        break;
      case "company":
        error = validateCompany(value);
        break;
      case "category":
        error = validateCategory(value);
        break;
      case "quantity":
        error = validateQuantity(value);
        break;
      default:
        break;
    }

    setErrors({ ...errors, [name]: error });
  };

  const handlePartNumberKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right, up, down
    if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    
    // Ensure that it is a number, letter, dash, or forward slash
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 65 || e.keyCode > 90) && 
        (e.keyCode < 97 || e.keyCode > 122) && 
        e.keyCode !== 189 && // dash (-)
        e.keyCode !== 191) { // forward slash (/)
      e.preventDefault();
    }
  };

  const handleAddProduct = async () => {
    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== "");
    if (hasErrors) {
      alert("Please fix all validation errors before submitting");
      return;
    }

    // Trim values
    const name = newProduct.name.trim();
    const partNumber = newProduct.partNumber.trim();
    const company = newProduct.company.trim();
    const image = newProduct.image.trim();
    const quantity = parseInt(newProduct.quantity);
    const price = parseFloat(newProduct.price);

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProduct,
          name,
          partNumber,
          company,
          image,
          price,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Product created successfully");
        navigate('/inventory');
      } else {
        alert("Error creating product: " + data.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert("Error creating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Create New Product
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  touched.name && errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part Number
              </label>
              <input
                type="text"
                name="partNumber"
                value={newProduct.partNumber}
                onChange={handleInputChange}
                onKeyDown={handlePartNumberKeyDown}
                placeholder="Enter part number"
                maxLength={19}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  touched.partNumber && errors.partNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {touched.partNumber && errors.partNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.partNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (Rs.)
              </label>
              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  touched.price && errors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {touched.price && errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={newProduct.image}
                onChange={handleInputChange}
                placeholder="Enter image URL (optional)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  touched.image && errors.image
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {touched.image && errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={newProduct.company}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  touched.company && errors.company
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {touched.company && errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  touched.category && errors.category
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {touched.category && errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={newProduct.quantity}
                onChange={handleInputChange}
                placeholder="Enter available quantity"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  touched.quantity && errors.quantity
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {touched.quantity && errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddProduct}
                disabled={loading || Object.values(errors).some(error => error !== "")}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
