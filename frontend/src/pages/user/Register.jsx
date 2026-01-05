import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const schema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .test('min-words', 'Name must contain at least two words', (value) => {
      return value && value.trim().split(/\s+/).length >= 2;
    }),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email format'
    ),
  nic: yup
    .string()
    .required('NIC is required')
    .test('nic-format', 'Please enter a valid NIC number', (value) => {
      if (!value) return false;
      
      const currentYear = new Date().getFullYear();
      
      // Old format: 9 digits + V/X
      const oldFormat = /^[0-9]{9}[VX]$/i;
      if (oldFormat.test(value)) {
        const firstTwoDigits = parseInt(value.substring(0, 2));
        const birthYear = 1900 + firstTwoDigits;
        return birthYear >= 1901 && birthYear <= currentYear;
      }
      
      // New format: 12 digits
      const newFormat = /^[0-9]{12}$/;
      if (newFormat.test(value)) {
        const birthYear = parseInt(value.substring(0, 4));
        return birthYear >= 1901 && birthYear <= currentYear;
      }
      
      return false;
    }),
  phone: yup
    .string()
    .required('Phone number is required')
    .test('phone-format', 'Phone number must be exactly 10 digits', (value) => {
      if (!value) return false;
      const phoneRegex = /^[0-9]{10}$/;
      return phoneRegex.test(value);
    }),
  address: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    district: yup.string().required('District is required'),
    postalCode: yup
      .string()
      .required('Postal code is required')
      .test('postal-code-format', 'Postal code must be exactly 5 digits', (value) => {
        if (!value) return false;
        const postalCodeRegex = /^[0-9]{5}$/;
        return postalCodeRegex.test(value);
      })
  }),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});

const Register = () => {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    }
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema)
  });

  // Watch specific form values for real-time validation
  const watchedName = watch('name');
  const watchedEmail = watch('email');
  const watchedNIC = watch('nic');
  const watchedPhone = watch('phone');
  const watchedPassword = watch('password');
  const watchedConfirmPassword = watch('confirmPassword');
  const watchedAddress = watch('address');

  // Update formData when form values change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: watchedName || '',
      email: watchedEmail || '',
      nic: watchedNIC || '',
      phone: watchedPhone || '',
      password: watchedPassword || '',
      confirmPassword: watchedConfirmPassword || '',
      address: watchedAddress || { street: '', city: '', district: '', postalCode: '' }
    }));
  }, [watchedName, watchedEmail, watchedNIC, watchedPhone, watchedPassword, watchedConfirmPassword, watchedAddress]);

  // Real-time validation functions
  const validateName = (value) => {
    if (!value) return { isValid: false, message: 'Name is required' };
    const words = value.trim().split(/\s+/);
    if (words.length < 2) return { isValid: false, message: 'Name must contain at least two words' };
    if (value.length < 3) return { isValid: false, message: 'Name must be at least 3 characters' };
    return { isValid: true, message: 'Name looks good!' };
  };

  const validateEmail = (value) => {
    if (!value) return { isValid: false, message: 'Email is required' };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) return { isValid: false, message: 'Please enter a valid email address' };
    return { isValid: true, message: 'Email format is valid!' };
  };

  const validateNIC = (value) => {
    if (!value) return { isValid: false, message: 'NIC is required' };
    
    const currentYear = new Date().getFullYear();
    
    // Old format: 9 digits + V/X
    const oldFormat = /^[0-9]{9}[VX]$/i;
    if (oldFormat.test(value)) {
      const firstTwoDigits = parseInt(value.substring(0, 2));
      const birthYear = 1900 + firstTwoDigits;
      
      // Check if birth year is valid (1901 to current year)
      if (birthYear < 1901 || birthYear > currentYear) {
        return { isValid: false, message: `Invalid birth year: ${birthYear}. Must be between 1901 and ${currentYear}` };
      }
      
      return { isValid: true, message: `NIC valid! Birth year: ${birthYear}` };
    }
    
    // New format: 12 digits
    const newFormat = /^[0-9]{12}$/;
    if (newFormat.test(value)) {
      const birthYear = parseInt(value.substring(0, 4));
      
      // Check if birth year is valid (1901 to current year)
      if (birthYear < 1901 || birthYear > currentYear) {
        return { isValid: false, message: `Invalid birth year: ${birthYear}. Must be between 1901 and ${currentYear}` };
      }
      
      return { isValid: true, message: `NIC valid! Birth year: ${birthYear}` };
    }
    
    // Partial input validation
    if (value.length <= 9) {
      // Only allow digits for first 9 characters
      if (!/^[0-9]+$/.test(value)) {
        return { isValid: false, message: 'Only digits allowed for first 9 characters' };
      }
      return { isValid: false, message: 'Enter 9 digits, then V/X or continue with digits' };
    }
    
    if (value.length === 10) {
      // Check if 10th character is V or X (old format) or digit (new format)
      if (/^[0-9]{9}[VX]$/i.test(value)) {
        // Old format detected, validate birth year
        const firstTwoDigits = parseInt(value.substring(0, 2));
        const birthYear = 1900 + firstTwoDigits;
        if (birthYear < 1901 || birthYear > currentYear) {
          return { isValid: false, message: `Invalid birth year: ${birthYear}. Must be between 1901 and ${currentYear}` };
        }
        return { isValid: true, message: `NIC valid! Birth year: ${birthYear}` };
      } else if (/^[0-9]{10}$/.test(value)) {
        return { isValid: false, message: 'Continue entering digits for new format (12 total)' };
      } else {
        return { isValid: false, message: '10th character should be V/X or digit' };
      }
    }
    
    if (value.length === 11) {
      if (/^[0-9]{11}$/.test(value)) {
        return { isValid: false, message: 'One more digit needed for new format' };
      } else {
        return { isValid: false, message: 'Invalid format. Use 9 digits + V/X or 12 digits' };
      }
    }
    
    if (value.length > 12) {
      return { isValid: false, message: 'NIC cannot exceed 12 characters' };
    }
    
    return { isValid: false, message: 'Please enter a valid NIC number' };
  };

  const validatePhone = (value) => {
    if (!value) return { isValid: false, message: 'Phone number is required' };
    if (value.length !== 10) return { isValid: false, message: 'Phone number must be exactly 10 digits' };
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(value)) return { isValid: false, message: 'Phone number must contain only digits' };
    return { isValid: true, message: 'Phone number is valid!' };
  };

  const validatePassword = (value) => {
    if (!value) return { isValid: false, message: 'Password is required' };
    if (value.length < 8) return { isValid: false, message: 'Password must be at least 8 characters' };
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[@$!%*?&]/.test(value);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return { isValid: false, message: 'Password must contain uppercase, lowercase, number, and special character' };
    }
    return { isValid: true, message: 'Password is strong!' };
  };

  const validateConfirmPassword = (value) => {
    if (!value) return { isValid: false, message: 'Please confirm your password' };
    if (value !== formData.password) return { isValid: false, message: 'Passwords do not match' };
    return { isValid: true, message: 'Passwords match!' };
  };

  const validateAddressField = (field, value) => {
    if (!value) return { isValid: false, message: `${field} is required` };
    if (value.length < 2) return { isValid: false, message: `${field} must be at least 2 characters` };
    return { isValid: true, message: `${field} looks good!` };
  };

  const validatePostalCode = (value) => {
    if (!value) return { isValid: false, message: 'Postal code is required' };
    if (value.length !== 5) return { isValid: false, message: 'Postal code must be exactly 5 digits' };
    const postalCodeRegex = /^[0-9]{5}$/;
    if (!postalCodeRegex.test(value)) return { isValid: false, message: 'Postal code must contain only digits' };
    return { isValid: true, message: 'Postal code is valid!' };
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength: strength,
      label: strengthLabels[strength - 1] || '',
      color: strengthColors[strength - 1] || ''
    };
  };

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    // Add passwordConfirm for backend
    const submitData = {
      ...userData,
      passwordConfirm: confirmPassword
    };
    console.log('Submitting data:', submitData);
    const result = await registerUser(submitData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our boat service community
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                      errors.name ? 'border-red-500' : 
                      formData.name && validateName(formData.name).isValid ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., John Doe"
                  />
                  {formData.name && (
                    <div className="mt-1 flex items-center">
                      {validateName(formData.name).isValid ? (
                        <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <p className={`text-sm ${
                        validateName(formData.name).isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {validateName(formData.name).message}
                      </p>
                    </div>
                  )}
                  {errors.name && !formData.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                      errors.email ? 'border-red-500' : 
                      formData.email && validateEmail(formData.email).isValid ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {formData.email && (
                    <div className="mt-1 flex items-center">
                      {validateEmail(formData.email).isValid ? (
                        <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <p className={`text-sm ${
                        validateEmail(formData.email).isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {validateEmail(formData.email).message}
                      </p>
                    </div>
                  )}
                  {errors.email && !formData.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="nic" className="block text-sm font-medium text-gray-700">
                    NIC Number *
                  </label>
                  <input
                    {...register('nic')}
                    type="text"
                    maxLength={12}
                    onKeyDown={(e) => {
                      // Always allow backspace, delete, arrow keys, etc.
                      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        return;
                      }
                      
                      // Block letters for first 9 characters
                      if (e.target.value.length < 9 && /[a-zA-Z]/.test(e.key)) {
                        e.preventDefault();
                        return;
                      }
                      
                      // For 10th character, allow V/X or digits
                      if (e.target.value.length === 9) {
                        if (!/[VXvx0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                        return;
                      }
                      
                      // For positions 10-12, only allow digits
                      if (e.target.value.length >= 10 && e.target.value.length < 12) {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                        return;
                      }
                      
                      // Block any input beyond 12 characters
                      if (e.target.value.length >= 12) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      
                      // Convert to uppercase for V/X
                      if (value.length === 10 && /[vx]/.test(value.charAt(9))) {
                        value = value.substring(0, 9) + value.charAt(9).toUpperCase();
                      }
                      
                      // Update the form value
                      setValue('nic', value);
                    }}
                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                      errors.nic ? 'border-red-500' : 
                      formData.nic && validateNIC(formData.nic).isValid ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 199012345678 or 901234567V"
                  />
                  {formData.nic && (
                    <div className="mt-1 flex items-center">
                      {validateNIC(formData.nic).isValid ? (
                        <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <p className={`text-sm ${
                        validateNIC(formData.nic).isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {validateNIC(formData.nic).message}
                      </p>
                    </div>
                  )}
                  {errors.nic && !formData.nic && (
                    <p className="mt-1 text-sm text-red-600">{errors.nic.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <div className="mt-1 flex">
                    <select className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-500 text-sm">
                      <option value="LK">🇱🇰 Sri Lanka</option>
                    </select>
                    <input
                      {...register('phone')}
                      type="tel"
                      maxLength={10}
                      onKeyDown={(e) => {
                        // Allow only digits and control keys
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e) => {
                        // Remove any non-digit characters and limit to 10 digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        e.target.value = value;
                      }}
                      className={`flex-1 px-3 py-2 border rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                        errors.phone ? 'border-red-500' : 
                        formData.phone && validatePhone(formData.phone).isValid ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="0771234567"
                    />
                  </div>
                  {formData.phone && (
                    <div className="mt-1 flex items-center">
                      {validatePhone(formData.phone).isValid ? (
                        <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <p className={`text-sm ${
                        validatePhone(formData.phone).isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {validatePhone(formData.phone).message}
                      </p>
                    </div>
                  )}
                  {errors.phone && !formData.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Address Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                        Street Address *
                      </label>
                      <input
                        {...register('address.street')}
                        type="text"
                        className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                          errors.address?.street ? 'border-red-500' : 
                          formData.address?.street && validateAddressField('Street', formData.address.street).isValid ? 'border-green-500' : 'border-gray-300'
                        }`}
                        placeholder="123 Main Street"
                      />
                      {formData.address?.street && (
                        <div className="mt-1 flex items-center">
                          {validateAddressField('Street', formData.address.street).isValid ? (
                            <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <p className={`text-sm ${
                            validateAddressField('Street', formData.address.street).isValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {validateAddressField('Street', formData.address.street).message}
                          </p>
                        </div>
                      )}
                      {errors.address?.street && !formData.address?.street && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          City *
                        </label>
                        <input
                          {...register('address.city')}
                          type="text"
                          className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                            errors.address?.city ? 'border-red-500' : 
                            formData.address?.city && validateAddressField('City', formData.address.city).isValid ? 'border-green-500' : 'border-gray-300'
                          }`}
                          placeholder="Colombo"
                        />
                        {formData.address?.city && (
                          <div className="mt-1 flex items-center">
                            {validateAddressField('City', formData.address.city).isValid ? (
                              <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <p className={`text-sm ${
                              validateAddressField('City', formData.address.city).isValid ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {validateAddressField('City', formData.address.city).message}
                            </p>
                          </div>
                        )}
                        {errors.address?.city && !formData.address?.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                          District *
                        </label>
                        <select
                          {...register('address.district')}
                          className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                            errors.address?.district ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select District</option>
                          {SRI_LANKAN_DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                        {errors.address?.district && (
                          <p className="mt-1 text-sm text-red-600">{errors.address.district.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                          Postal Code *
                        </label>
                        <input
                          {...register('address.postalCode')}
                          type="text"
                          maxLength={5}
                          onKeyDown={(e) => {
                            // Allow only digits and control keys
                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onInput={(e) => {
                            // Remove any non-digit characters and limit to 5 digits
                            const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                            e.target.value = value;
                          }}
                          className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                            errors.address?.postalCode ? 'border-red-500' : 
                            formData.address?.postalCode && validatePostalCode(formData.address.postalCode).isValid ? 'border-green-500' : 'border-gray-300'
                          }`}
                          placeholder="00100"
                        />
                        {formData.address?.postalCode && (
                          <div className="mt-1 flex items-center">
                            {validatePostalCode(formData.address.postalCode).isValid ? (
                              <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <p className={`text-sm ${
                              validatePostalCode(formData.address.postalCode).isValid ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {validatePostalCode(formData.address.postalCode).message}
                            </p>
                          </div>
                        )}
                        {errors.address?.postalCode && !formData.address?.postalCode && (
                          <p className="mt-1 text-sm text-red-600">{errors.address.postalCode.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                        errors.password ? 'border-red-500' : 
                        formData.password && validatePassword(formData.password).isValid ? 'border-green-500' : 'border-gray-300'
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Password Strength:</span>
                        <span className={`text-sm font-medium ${
                          getPasswordStrength(formData.password).strength >= 4 ? 'text-green-600' : 
                          getPasswordStrength(formData.password).strength >= 3 ? 'text-blue-600' :
                          getPasswordStrength(formData.password).strength >= 2 ? 'text-yellow-600' :
                          getPasswordStrength(formData.password).strength >= 1 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {getPasswordStrength(formData.password).label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            getPasswordStrength(formData.password).color
                          }`}
                          style={{ width: `${(getPasswordStrength(formData.password).strength / 5) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="mt-2 space-y-1">
                        <div className={`flex items-center text-sm ${
                          formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {formData.password.length >= 8 ? (
                            <FaCheck className="h-3 w-3 mr-2" />
                          ) : (
                            <FaTimes className="h-3 w-3 mr-2" />
                          )}
                          At least 8 characters
                        </div>
                        <div className={`flex items-center text-sm ${
                          /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {/[A-Z]/.test(formData.password) ? (
                            <FaCheck className="h-3 w-3 mr-2" />
                          ) : (
                            <FaTimes className="h-3 w-3 mr-2" />
                          )}
                          One uppercase letter
                        </div>
                        <div className={`flex items-center text-sm ${
                          /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {/[a-z]/.test(formData.password) ? (
                            <FaCheck className="h-3 w-3 mr-2" />
                          ) : (
                            <FaTimes className="h-3 w-3 mr-2" />
                          )}
                          One lowercase letter
                        </div>
                        <div className={`flex items-center text-sm ${
                          /\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {/\d/.test(formData.password) ? (
                            <FaCheck className="h-3 w-3 mr-2" />
                          ) : (
                            <FaTimes className="h-3 w-3 mr-2" />
                          )}
                          One number
                        </div>
                        <div className={`flex items-center text-sm ${
                          /[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {/[@$!%*?&]/.test(formData.password) ? (
                            <FaCheck className="h-3 w-3 mr-2" />
                          ) : (
                            <FaTimes className="h-3 w-3 mr-2" />
                          )}
                          One special character (@$!%*?&)
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.password && (
                    <div className="mt-1 flex items-center">
                      {validatePassword(formData.password).isValid ? (
                        <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <p className={`text-sm ${
                        validatePassword(formData.password).isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {validatePassword(formData.password).message}
                      </p>
                    </div>
                  )}
                  {errors.password && !formData.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                        errors.confirmPassword ? 'border-red-500' : 
                        formData.confirmPassword && validateConfirmPassword(formData.confirmPassword).isValid ? 'border-green-500' : 'border-gray-300'
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
                  {formData.confirmPassword && (
                    <div className="mt-1 flex items-center">
                      {validateConfirmPassword(formData.confirmPassword).isValid ? (
                        <FaCheck className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <FaTimes className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <p className={`text-sm ${
                        validateConfirmPassword(formData.confirmPassword).isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {validateConfirmPassword(formData.confirmPassword).message}
                      </p>
                    </div>
                  )}
                  {errors.confirmPassword && !formData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
