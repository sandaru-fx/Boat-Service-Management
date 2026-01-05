import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import ChangePassword from '../../components/ChangePassword';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const EmployeeProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nic: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    },
    employeeId: '',
    position: '',
    hireDate: '',
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

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
        },
        employeeId: user.employeeData?.employeeId || '',
        position: user.employeeData?.position || '',
        hireDate: user.employeeData?.hireDate || user.createdAt || '',
        dateOfBirth: user.employeeData?.dateOfBirth || user.createdAt || '',
        emergencyContact: user.employeeData?.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        },
        status: user.isActive ? 'Active' : 'Inactive'
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    // Special handling for phone fields - restrict to numbers only and max 10 digits
    if (field === 'phone' || field === 'emergencyContact.phone') {
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

      case 'emergencyContact.name':
        if (value && value.trim().length < 2) {
          newErrors['emergencyContact.name'] = 'Contact name must be at least 2 characters';
          hasError = true;
        } else if (value && !/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors['emergencyContact.name'] = 'Contact name can only contain letters and spaces';
          hasError = true;
        }
        break;

      case 'emergencyContact.phone':
        if (value && !/^\d{10}$/.test(value)) {
          newErrors['emergencyContact.phone'] = 'Phone number must be exactly 10 digits';
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
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          employeeData: {
            emergencyContact: formData.emergencyContact
          }
        })
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
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      nic: user?.nic || '',
      address: user?.address || {
        street: '',
        city: '',
        district: '',
        postalCode: ''
      },
      employeeId: user?.employeeData?.employeeId || '',
      position: user?.employeeData?.position || '',
      hireDate: user?.employeeData?.hireDate || user?.createdAt || '',
      dateOfBirth: user?.employeeData?.dateOfBirth || user?.createdAt || '',
      emergencyContact: user?.employeeData?.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      status: user?.isActive ? 'Active' : 'Inactive'
    });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="text-4xl text-teal-600">
                <FaUser />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
                <p className="text-gray-600">View and update your employee information</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={Object.keys(errors).length > 0}
                    className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                    title={Object.keys(errors).length > 0 ? 'Please fix validation errors before saving' : ''}
                  >
                    <FaSave className="mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-gray-900">{formData.name}</p>
                  )}
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
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
                    <p className="text-gray-900">{formData.phone}</p>
                  )}
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number</label>
                  <input
                    type="text"
                    value={formData.nic}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <p className="text-gray-900 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                    {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          errors['emergencyContact.name'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        } pr-10`}
                        placeholder="Enter contact name"
                      />
                      {errors['emergencyContact.name'] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">{formData.emergencyContact.name || 'Not provided'}</p>
                  )}
                  {errors['emergencyContact.name'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.name']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          errors['emergencyContact.phone'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        } pr-10`}
                        placeholder="e.g., 0771234567"
                      />
                      {errors['emergencyContact.phone'] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">{formData.emergencyContact.phone || 'Not provided'}</p>
                  )}
                  {errors['emergencyContact.phone'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.phone']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  {isEditing ? (
                    <select
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Friend">Friend</option>
                      <option value="Relative">Relative</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{formData.emergencyContact.relationship || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
              <div className="space-y-4">
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
                    <p className="text-gray-900">{formData.address.street}</p>
                  )}
                  {errors['address.street'] && <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <p className="text-gray-900">{formData.address.city}</p>
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
                      <p className="text-gray-900">{formData.address.district}</p>
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
                      <p className="text-gray-900">{formData.address.postalCode}</p>
                    )}
                    {errors['address.postalCode'] && <p className="text-red-500 text-sm mt-1">{errors['address.postalCode']}</p>}
                    {isEditing && !errors['address.postalCode'] && (
                      <p className="text-gray-500 text-sm mt-1">Enter exactly 5 digits (numbers only)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <p className="text-gray-900 font-mono bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                    {formData.employeeId || 'EMP001'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <p className="text-gray-900 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                    {formData.position || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                  <p className="text-gray-900 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                    {formData.hireDate ? new Date(formData.hireDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <input
                    type="text"
                    value={formData.status}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Change Password Section */}
        <div className="mt-8">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
