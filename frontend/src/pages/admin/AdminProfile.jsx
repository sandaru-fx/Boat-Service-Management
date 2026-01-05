import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEdit, FaSave, FaTimes, FaStar, FaCheckCircle, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import ChangePassword from '../../components/ChangePassword';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          district: '',
          postalCode: ''
        }
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    // Special handling for phone fields - restrict to numbers only and max 10 digits
    if (field === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits maximum
      const limitedValue = digitsOnly.slice(0, 10);
      value = limitedValue;
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Real-time validation
    validateField(field, value);
  };

  // Real-time field validation
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    let hasError = false;

    switch (field) {
      case 'name':
        if (!value?.trim()) {
          newErrors.name = 'Name is required';
          hasError = true;
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
          hasError = true;
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.name = 'Name can only contain letters and spaces';
          hasError = true;
        }
        break;

      case 'phone':
        if (!value?.trim()) {
          newErrors.phone = 'Phone number is required';
          hasError = true;
        } else if (!/^\d{10}$/.test(value)) {
          newErrors.phone = 'Phone number must be exactly 10 digits';
          hasError = true;
        }
        break;

      case 'address.street':
        if (!value?.trim()) {
          newErrors['address.street'] = 'Street address is required';
          hasError = true;
        } else if (value.trim().length < 5) {
          newErrors['address.street'] = 'Street address must be at least 5 characters';
          hasError = true;
        }
        break;

      case 'address.city':
        if (!value?.trim()) {
          newErrors['address.city'] = 'City is required';
          hasError = true;
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors['address.city'] = 'City can only contain letters and spaces';
          hasError = true;
        } else if (value.trim().length < 2) {
          newErrors['address.city'] = 'City must be at least 2 characters';
          hasError = true;
        }
        break;

      case 'address.district':
        if (!value?.trim()) {
          newErrors['address.district'] = 'District is required';
          hasError = true;
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors['address.district'] = 'District can only contain letters and spaces';
          hasError = true;
        } else if (value.trim().length < 2) {
          newErrors['address.district'] = 'District must be at least 2 characters';
          hasError = true;
        }
        break;

      case 'address.postalCode':
        if (!value?.trim()) {
          newErrors['address.postalCode'] = 'Postal code is required';
          hasError = true;
        } else if (!/^\d{5}$/.test(value.trim())) {
          newErrors['address.postalCode'] = 'Postal code must be exactly 5 digits';
          hasError = true;
        }
        break;

      default:
        break;
    }

    if (hasError) {
      setErrors(newErrors);
    } else if (newErrors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      setErrors(updatedErrors);
    }
  };

  const handleSave = async () => {
    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      if (!user || !user._id) {
        toast.error('User information not available. Please refresh the page.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setErrors({});
        // Update the user context with new data
        const updatedUser = { ...user, ...formData };
        updateUser(updatedUser);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || {
        street: '',
        city: '',
        district: '',
        postalCode: ''
      }
    });
    setIsEditing(false);
    setErrors({});
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 mr-4">
                <FaStar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  Admin Profile
                  <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ADMIN
                  </span>
                </h1>
                <p className="text-gray-600">Manage your administrator account</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                <FaCheckCircle className="inline mr-1" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FaUser className="mr-2 text-teal-600" />
              Personal Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                      } pr-10`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.name}</p>
                )}
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                      } pr-10`}
                      placeholder="e.g., 0771234567"
                    />
                    {errors.phone && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.phone}</p>
                )}
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors['address.street'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                      } pr-10`}
                      placeholder="Enter street address"
                    />
                    {errors['address.street'] && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.address?.street || 'Not provided'}</p>
                )}
                {errors['address.street'] && <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors['address.city'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                      } pr-10`}
                      placeholder="Enter city"
                    />
                    {errors['address.city'] && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.address?.city || 'Not provided'}</p>
                )}
                {errors['address.city'] && <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                {isEditing ? (
                  <select
                    value={formData.address.district}
                    onChange={(e) => handleInputChange('address.district', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors['address.district'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    }`}
                  >
                    <option value="">Select District</option>
                    {SRI_LANKAN_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.address?.district || 'Not provided'}</p>
                )}
                {errors['address.district'] && <p className="text-red-500 text-sm mt-1">{errors['address.district']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors['address.postalCode'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                      } pr-10`}
                      placeholder="e.g., 12345"
                      maxLength="5"
                      pattern="[0-9]{5}"
                    />
                    {errors['address.postalCode'] && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.address?.postalCode || 'Not provided'}</p>
                )}
                {errors['address.postalCode'] && <p className="text-red-500 text-sm mt-1">{errors['address.postalCode']}</p>}
                {isEditing && !errors['address.postalCode'] && (
                  <p className="text-gray-500 text-sm mt-1">Enter exactly 5 digits (numbers only)</p>
                )}
              </div>
            </div>
          </div>

          {/* Admin-specific Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Administrator Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Level</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {user.adminData?.adminLevel === 'super' ? 'Super Administrator' : 'Regular Administrator'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.nic}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {user.adminData?.lastLogin ? new Date(user.adminData.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || Object.keys(errors).length > 0}
                className="flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                title={Object.keys(errors).length > 0 ? 'Please fix validation errors before saving' : ''}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Change Password Section */}
        <div className="mt-8">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
