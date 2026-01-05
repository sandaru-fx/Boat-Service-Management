import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get the return path from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const returnPath = urlParams.get('from') || '/dashboard';
  
  // Form data state for real-time validation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nic: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    },
    employeeId: '',
    position: '',
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthColor, setPasswordStrengthColor] = useState('bg-gray-300');

  // Validation functions
  const validateRequired = (value, fieldName) => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    return '';
  };

  const validateTextInput = (value, fieldName, minLength) => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    if (value.trim().length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateNIC = (nic) => {
    if (!nic) return 'NIC is required';
    
    // Only validate complete NICs - same as customer registration
    if (nic.length === 10) {
      // Old format: 9 digits + V/X
      const oldFormat = /^[0-9]{9}[VX]$/i;
      if (!oldFormat.test(nic)) {
        return 'Invalid old NIC format: 9 digits followed by V or X';
      }
    } else if (nic.length === 12) {
      // New format: 12 digits (first 4 as birth year)
      const newFormat = /^[0-9]{12}$/;
      if (!newFormat.test(nic)) {
        return 'Invalid new NIC format: exactly 12 digits';
      }
      
      // Validate birth year for new format
      const birthYear = parseInt(nic.substring(0, 4));
      const currentYear = new Date().getFullYear();
      
      if (birthYear < 1901) {
        return 'Birth year cannot be before 1901';
      } else if (birthYear > currentYear) {
        return 'Birth year cannot be in the future';
      }
    } else if (nic.length < 10) {
      // Don't show "valid" until complete
      return '';
    } else if (nic.length === 11) {
      return 'NIC must be 10 digits (old format) or 12 digits (new format)';
    } else if (nic.length > 12) {
      return 'NIC cannot exceed 12 characters';
    }
    
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    // Must start with 0 and be exactly 10 digits
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Phone number must start with 0 and be exactly 10 digits';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    
    // Check individual requirements
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    setPasswordRequirements(requirements);
    
    // Calculate password strength (0-100)
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const strength = (metRequirements / 5) * 100;
    setPasswordStrength(strength);
    
    // Set color based on strength
    if (strength < 40) {
      setPasswordStrengthColor('bg-red-500');
    } else if (strength < 80) {
      setPasswordStrengthColor('bg-yellow-500');
    } else {
      setPasswordStrengthColor('bg-green-500');
    }
    
    if (password.length < 8) return 'Password must be at least 8 characters';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return '';
  };

  const validateNICBirthYear = (nic, dateOfBirth) => {
    if (!nic || !dateOfBirth) return '';
    
    const birthYear = new Date(dateOfBirth).getFullYear();
    const birthYearStr = birthYear.toString();
    
    // New NIC format (12 digits) - first 4 digits should match birth year
    if (nic.length === 12) {
      const nicYear = nic.substring(0, 4);
      if (nicYear !== birthYearStr) {
        return 'NIC birth year does not match the date of birth';
      }
    }
    
    // Old NIC format (9 digits + V/X) - first 2 digits should match last 2 digits of birth year
    if (nic.length === 10) {
      const nicYear = nic.substring(0, 2);
      const birthYearLastTwo = birthYearStr.substring(2, 4);
      if (nicYear !== birthYearLastTwo) {
        return 'NIC birth year does not match the date of birth';
      }
    }
    
    return '';
  };

  const handleInputChange = (field, value) => {
    // Special handling for NIC input to prevent invalid characters
    if (field === 'nic') {
      // Remove any non-digit characters except V/X at position 10
      let filteredValue = value;
      
      if (value.length <= 9) {
        // First 9 characters: digits only
        filteredValue = value.replace(/[^0-9]/g, '');
      } else if (value.length === 10) {
        // 10th character: V or X only (old format)
        const first9 = value.substring(0, 9).replace(/[^0-9]/g, '');
        const lastChar = value.charAt(9).toUpperCase();
        if (lastChar === 'V' || lastChar === 'X') {
          filteredValue = first9 + lastChar;
        } else {
          // If not V/X, treat as new format (digits only)
          filteredValue = value.replace(/[^0-9]/g, '').substring(0, 12);
        }
      } else if (value.length > 10) {
        // For new format: digits only, max 12
        filteredValue = value.replace(/[^0-9]/g, '').substring(0, 12);
      }
      
      value = filteredValue;
    }
    
    // Special handling for phone input to enforce 0 prefix and 10 digits
    if (field === 'phone') {
      // Remove any non-digit characters
      let filteredValue = value.replace(/[^0-9]/g, '');
      
      // If it doesn't start with 0, add 0
      if (filteredValue.length > 0 && !filteredValue.startsWith('0')) {
        filteredValue = '0' + filteredValue;
      }
      
      // Limit to 10 digits
      filteredValue = filteredValue.substring(0, 10);
      
      value = filteredValue;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation
    let error = '';

    if (field === 'name') {
      error = validateTextInput(value, 'Name', 2);
      if (!error && value.trim().split(/\s+/).length < 2) {
        error = 'Name must contain at least two words';
      }
    } else if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'nic') {
      error = validateNIC(value);
      // Also validate against birth year if both are filled
      if (!error && formData.dateOfBirth) {
        error = validateNICBirthYear(value, formData.dateOfBirth);
      }
    } else if (field === 'phone') {
      error = validatePhone(value);
    } else if (field === 'password') {
      error = validatePassword(value);
    } else if (field === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password';
      } else if (value !== formData.password) {
        error = 'Passwords do not match';
      }
    } else if (field === 'employeeId') {
      // Employee ID is optional, no validation needed
    } else if (field === 'position') {
      error = validateRequired(value, 'Position');
    } else if (field === 'dateOfBirth') {
      error = validateRequired(value, 'Date of birth');
      if (!error && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) {
          error = 'Date of birth cannot be in the future';
        }
        // Also validate against NIC if both are filled
        if (!error && formData.nic) {
          error = validateNICBirthYear(formData.nic, value);
        }
      }
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    // Special handling for postal code to block letters
    if (parent === 'address' && field === 'postalCode') {
      // Check if user is trying to enter letters
      if (/[a-zA-Z]/.test(value)) {
        // Show error for letters but don't update the value
        setErrors(prev => ({
          ...prev,
          'address.postalCode': 'Digits only'
        }));
        return; // Don't update the form data
      }
      // Remove any non-digit characters and limit to 5 digits
      value = value.replace(/[^0-9]/g, '').substring(0, 5);
    }
    
    // Special handling for emergency contact phone to enforce 0 prefix and 10 digits
    if (parent === 'emergencyContact' && field === 'phone') {
      // Remove any non-digit characters
      let filteredValue = value.replace(/[^0-9]/g, '');
      
      // If it doesn't start with 0, add 0
      if (filteredValue.length > 0 && !filteredValue.startsWith('0')) {
        filteredValue = '0' + filteredValue;
      }
      
      // Limit to 10 digits
      filteredValue = filteredValue.substring(0, 10);
      
      value = filteredValue;
    }

    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));

    // Real-time validation for nested fields
    let error = '';
    const fieldPath = `${parent}.${field}`;

    if (fieldPath === 'address.street') {
      error = validateRequired(value, 'Street address');
    } else if (fieldPath === 'address.city') {
      error = validateRequired(value, 'City');
    } else if (fieldPath === 'address.district') {
      error = validateRequired(value, 'District');
           } else if (fieldPath === 'address.postalCode') {
             error = validateRequired(value, 'Postal code');
             if (!error && value) {
               // Postal code should be exactly 5 digits
               if (!/^[0-9]{5}$/.test(value)) {
                 error = 'Postal code must be exactly 5 digits';
               }
             }
           } else if (fieldPath === 'emergencyContact.name') {
      error = validateRequired(value, 'Emergency contact name');
    } else if (fieldPath === 'emergencyContact.phone') {
      error = validatePhone(value);
    } else if (fieldPath === 'emergencyContact.relationship') {
      error = validateRequired(value, 'Relationship');
    }

    setErrors(prev => ({
      ...prev,
      [fieldPath]: error
    }));
  };

  const onSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Use formData for submission as it's kept in sync with real-time validation
    const { confirmPassword, ...employeeData } = formData;
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');

      const requestData = {
        ...employeeData,
        passwordConfirm: confirmPassword,
        role: 'employee'
      };

      console.log('Sending data:', requestData);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('Response:', result);

      if (response.ok && result.success) {
        toast.success('Employee account created successfully!');
        navigate('/admin/users');
      } else {
        throw new Error(result.message || result.error || 'Failed to create employee account');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error(error.message || 'Failed to create employee account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(returnPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Employee Account</h1>
          <p className="text-gray-600 mt-2">Add a new employee to the system with detailed information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaUser className="mr-2 text-teal-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.name ? 'border-red-500' : formData.name && !errors.name ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., John Doe"
                  />
                  {errors.name ? (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  ) : formData.name && formData.name.trim().split(/\s+/).length >= 2 && !errors.name && (
                    <p className="text-green-600 text-sm mt-1">✓ Valid name</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.email ? 'border-red-500' : formData.email && !errors.email ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email ? (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  ) : formData.email && !errors.email && (
                    <p className="text-green-600 text-sm mt-1">✓ Valid email</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIC Number *
                  </label>
                  <input
                    type="text"
                    value={formData.nic}
                    onChange={(e) => handleInputChange('nic', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.nic ? 'border-red-500' : formData.nic && (formData.nic.length === 10 || formData.nic.length === 12) && !errors.nic ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 199012345678 or 901234567V"
                  />
                  {errors.nic ? (
                    <p className="text-red-500 text-sm mt-1">{errors.nic}</p>
                  ) : formData.nic && (formData.nic.length === 10 || formData.nic.length === 12) && !errors.nic && (
                    <p className="text-green-600 text-sm mt-1">✓ Valid NIC</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <select className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 text-sm">
                      <option value="LK">🇱🇰 Sri Lanka</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.phone ? 'border-red-500' : formData.phone && !errors.phone ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="077 123 4567"
                    />
                  </div>
                  {errors.phone ? (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  ) : formData.phone && !errors.phone && (
                    <p className="text-green-600 text-sm mt-1">✓ Valid phone number</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaUser className="mr-2 text-teal-600" />
                Account Security
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.password ? 'border-red-500' : formData.password && !errors.password ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Progress Bar */}
                  {formData.password && passwordStrength < 100 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Password Strength</span>
                        <span>{Math.round(passwordStrength)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrengthColor}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Password Requirements - Only show if password is not fully valid */}
                  {formData.password && passwordStrength < 100 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                      <ul className="text-xs space-y-1">
                        <li className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`mr-2 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordRequirements.length ? '✓' : '○'}
                          </span>
                          At least 8 characters
                        </li>
                        <li className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`mr-2 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordRequirements.uppercase ? '✓' : '○'}
                          </span>
                          One uppercase letter
                        </li>
                        <li className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`mr-2 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordRequirements.lowercase ? '✓' : '○'}
                          </span>
                          One lowercase letter
                        </li>
                        <li className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`mr-2 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordRequirements.number ? '✓' : '○'}
                          </span>
                          One number
                        </li>
                        <li className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`mr-2 ${passwordRequirements.special ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordRequirements.special ? '✓' : '○'}
                          </span>
                          One special character (@$!%*?&)
                        </li>
                      </ul>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.confirmPassword ? 'border-red-500' : formData.confirmPassword && !errors.confirmPassword ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword ? (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  ) : formData.confirmPassword && !errors.confirmPassword && (
                    <p className="text-green-600 text-sm mt-1">✓ Passwords match</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaBriefcase className="mr-2 text-teal-600" />
                Employee Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           Employee ID (Optional)
                         </label>
                         <input
                           type="text"
                           value={formData.employeeId}
                           onChange={(e) => handleInputChange('employeeId', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                             errors.employeeId ? 'border-red-500' : formData.employeeId && !errors.employeeId ? 'border-green-500' : 'border-gray-300'
                           }`}
                           placeholder="Leave empty for auto-generation (e.g., EMP001)"
                         />
                         {errors.employeeId ? (
                           <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>
                         ) : formData.employeeId && !errors.employeeId && (
                           <p className="text-green-600 text-sm mt-1">✓ Valid employee ID</p>
                         )}
                         <p className="text-gray-500 text-xs mt-1">
                           If left empty, system will auto-generate (EMP001, EMP002, etc.)
                         </p>
                       </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.position ? 'border-red-500' : formData.position && !errors.position ? 'border-green-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select position</option>
                    <option value="General Employee">General Employee</option>
                    <option value="Technician">Technician</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Repair Specialist">Repair Specialist</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Manager">Manager</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                  {errors.position ? (
                    <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                  ) : formData.position && !errors.position && (
                    <p className="text-green-600 text-sm mt-1">✓ Position selected</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.dateOfBirth ? 'border-red-500' : formData.dateOfBirth && !errors.dateOfBirth ? 'border-green-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfBirth ? (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                  ) : formData.dateOfBirth && !errors.dateOfBirth && (
                    <p className="text-green-600 text-sm mt-1">✓ Valid date of birth</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-teal-600" />
                Address Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors['address.street'] ? 'border-red-500' : formData.address.street && !errors['address.street'] ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors['address.street'] ? (
                    <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>
                  ) : formData.address.street && !errors['address.street'] && (
                    <p className="text-green-600 text-sm mt-1">✓ Valid street address</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors['address.city'] ? 'border-red-500' : formData.address.city && !errors['address.city'] ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="Colombo"
                    />
                    {errors['address.city'] ? (
                      <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>
                    ) : formData.address.city && !errors['address.city'] && (
                      <p className="text-green-600 text-sm mt-1">✓ Valid city</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <select
                      value={formData.address.district}
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
                    {errors['address.district'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['address.district']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors['address.postalCode'] ? 'border-red-500' : formData.address.postalCode && !errors['address.postalCode'] ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="00100"
                      maxLength="5"
                    />
                    {errors['address.postalCode'] ? (
                      <p className="text-red-500 text-sm mt-1">{errors['address.postalCode']}</p>
                    ) : formData.address.postalCode && !errors['address.postalCode'] && (
                      <p className="text-green-600 text-sm mt-1">✓ Valid postal code</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaPhone className="mr-2 text-teal-600" />
                Emergency Contact
              </h2>
              
              <div className="space-y-4">
                {/* Contact Name and Relationship - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact.name}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors['emergencyContact.name'] ? 'border-red-500' : formData.emergencyContact.name && !errors['emergencyContact.name'] ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter emergency contact name"
                    />
                    {errors['emergencyContact.name'] ? (
                      <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.name']}</p>
                    ) : formData.emergencyContact.name && !errors['emergencyContact.name'] && (
                      <p className="text-green-600 text-sm mt-1">✓ Valid contact name</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <select
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors['emergencyContact.relationship'] ? 'border-red-500' : formData.emergencyContact.relationship && !errors['emergencyContact.relationship'] ? 'border-green-500' : 'border-gray-300'
                      }`}
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
                    {errors['emergencyContact.relationship'] ? (
                      <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.relationship']}</p>
                    ) : formData.emergencyContact.relationship && !errors['emergencyContact.relationship'] && (
                      <p className="text-green-600 text-sm mt-1">✓ Relationship selected</p>
                    )}
                  </div>
                </div>

                {/* Contact Phone - Full Width Below */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <div className="flex">
                    <select className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 text-sm">
                      <option value="LK">🇱🇰 Sri Lanka</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors['emergencyContact.phone'] ? 'border-red-500' : formData.emergencyContact.phone && !errors['emergencyContact.phone'] ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="077 123 4567"
                    />
                  </div>
                  {errors['emergencyContact.phone'] ? (
                    <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.phone']}</p>
                  ) : formData.emergencyContact.phone && !errors['emergencyContact.phone'] && (
                    <p className="text-green-600 text-sm mt-1">✓ Valid phone number</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployee;
