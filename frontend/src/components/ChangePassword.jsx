import React, { useState, useEffect } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ChangePassword = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    // Check password requirements
    const password = formData.newPassword;
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.newPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!passwordRequirements.uppercase || !passwordRequirements.lowercase || 
               !passwordRequirements.number || !passwordRequirements.special) {
      newErrors.newPassword = 'Password must meet all requirements';
    }

    if (!formData.newPasswordConfirm.trim()) {
      newErrors.newPasswordConfirm = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.newPasswordConfirm) {
      newErrors.newPasswordConfirm = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('ChangePassword - Token:', token ? 'Token exists' : 'No token');
      console.log('ChangePassword - Request URL:', `${process.env.REACT_APP_API_URL}/auth/change-password`);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          newPasswordConfirm: formData.newPasswordConfirm
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          newPasswordConfirm: ''
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FaLock className="mr-2 text-teal-600" />
        Change Password
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.currentPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.current ? (
                <FaEyeSlash className="h-4 w-4 text-gray-400" />
              ) : (
                <FaEye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.newPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.new ? (
                <FaEyeSlash className="h-4 w-4 text-gray-400" />
              ) : (
                <FaEye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Password Requirements */}
        {formData.newPassword && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
            <ul className="text-sm space-y-1">
              <li className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.length ? '✓' : '○'}</span>
                At least 8 characters
              </li>
              <li className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.uppercase ? '✓' : '○'}</span>
                One uppercase letter
              </li>
              <li className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.lowercase ? '✓' : '○'}</span>
                One lowercase letter
              </li>
              <li className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.number ? '✓' : '○'}</span>
                One number
              </li>
              <li className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.special ? '✓' : '○'}</span>
                One special character
              </li>
            </ul>
          </div>
        )}

        <div>
          <label htmlFor="newPasswordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="newPasswordConfirm"
              name="newPasswordConfirm"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.newPasswordConfirm}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.newPasswordConfirm ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.confirm ? (
                <FaEyeSlash className="h-4 w-4 text-gray-400" />
              ) : (
                <FaEye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.newPasswordConfirm && (
            <p className="mt-1 text-sm text-red-600">{errors.newPasswordConfirm}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                currentPassword: '',
                newPassword: '',
                newPasswordConfirm: ''
              });
              setErrors({});
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
