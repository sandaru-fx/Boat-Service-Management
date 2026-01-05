import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        nic: user.nic || '',
        address: user.address || {
          street: '',
          city: '',
          district: '',
          postalCode: ''
        }
      });
      setLoading(false);
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    // Special handling for phone fields - restrict to numbers only and max 10 digits
    if (field === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits maximum
      const limitedValue = digitsOnly.slice(0, 10);
      value = limitedValue;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle nested input changes (for address)
  const handleNestedInputChange = (parent, field, value) => {
    // Special handling for postal code - restrict to numbers only and max 5 digits
    if (field === 'postalCode') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 5 digits maximum
      const limitedValue = digitsOnly.slice(0, 5);
      value = limitedValue;
    }

    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    const errorKey = `${parent}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  // Validation functions
  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().split(' ').length < 2) return 'Name must contain at least two words';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name can only contain letters and spaces';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (value.length !== 10) return 'Phone number must be exactly 10 digits';
        if (!/^[0-9]{10}$/.test(value)) return 'Phone number must contain only digits';
        return '';

      case 'nic':
        if (!value.trim()) return 'NIC is required';
        if (!/^[0-9]{9}[vVxX]?$/.test(value)) return 'Please enter a valid NIC number';
        return '';

      default:
        return '';
    }
  };

  const validateNestedField = (parent, field, value) => {
    const fieldKey = `${parent}.${field}`;
    
    switch (field) {
      case 'street':
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 5) return 'Street address must be at least 5 characters';
        return '';

      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'City must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'City can only contain letters and spaces';
        return '';

      case 'district':
        if (!value.trim()) return 'District is required';
        return '';

      case 'postalCode':
        if (!value.trim()) return 'Postal code is required';
        if (value.length !== 5) return 'Postal code must be exactly 5 digits';
        if (!/^[0-9]{5}$/.test(value)) return 'Postal code must contain only digits';
        return '';

      default:
        return '';
    }
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Validate basic fields
    const basicFields = ['name', 'phone'];
    basicFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Validate address fields
    const addressFields = ['street', 'city', 'district', 'postalCode'];
    addressFields.forEach(field => {
      const error = validateNestedField('address', field, formData.address?.[field] || '');
      if (error) newErrors[`address.${field}`] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save changes
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.data.user);
        toast.success('Profile updated successfully!');
        setEditing(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimesCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your profile.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  {getStatusBadge(user.isActive)}
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    <FaUser className="w-3 h-3 mr-1 inline" />
                    Customer
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setErrors({});
                      // Reset form data
                      setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        nic: user.nic || '',
                        address: user.address || {
                          street: '',
                          city: '',
                          district: '',
                          postalCode: ''
                        }
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || Object.keys(errors).length > 0}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                    title={Object.keys(errors).length > 0 ? 'Please fix validation errors before saving' : ''}
                  >
                    <FaSave className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUser className="mr-2 text-teal-600" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {editing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
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
                  <p className="text-gray-900">{user.name}</p>
                )}
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-gray-900 flex items-center">
                  <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                  {user.email}
                </p>
                <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {editing ? (
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
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
                  <p className="text-gray-900 flex items-center">
                    <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                    {user.phone}
                  </p>
                )}
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIC</label>
                <p className="text-gray-900 flex items-center">
                  <FaIdCard className="w-4 h-4 mr-2 text-gray-400" />
                  {user.nic}
                </p>
                <p className="text-gray-500 text-sm mt-1">NIC cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-teal-600" />
              Address Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.address?.street || ''}
                    onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors['address.street'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="text-gray-900">{user.address?.street || 'N/A'}</p>
                )}
                {errors['address.street'] && <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.city || 'N/A'}</p>
                  )}
                  {errors['address.city'] && <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  {editing ? (
                    <select
                      value={formData.address?.district || ''}
                      onChange={(e) => handleNestedInputChange('address', 'district', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors['address.district'] ? 'border-red-500' : 'border-gray-300'
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
                    <p className="text-gray-900">{user.address?.district || 'N/A'}</p>
                  )}
                  {errors['address.district'] && <p className="text-red-500 text-sm mt-1">{errors['address.district']}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                {editing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address?.postalCode || ''}
                      onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
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
                  <p className="text-gray-900">{user.address?.postalCode || 'N/A'}</p>
                )}
                {errors['address.postalCode'] && <p className="text-red-500 text-sm mt-1">{errors['address.postalCode']}</p>}
                {editing && !errors['address.postalCode'] && (
                  <p className="text-gray-500 text-sm mt-1">Enter exactly 5 digits (numbers only)</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <FaCalendarAlt className="mr-2 text-teal-600" />
            Account Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
              <p className="text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
