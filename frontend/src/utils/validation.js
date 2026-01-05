// Real-time validation utilities
import { useState } from 'react';

// Email validation
export const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!email) return { isValid: false, message: 'Email is required' };
	if (!emailRegex.test(email)) return { isValid: false, message: 'Please enter a valid email address' };
	return { isValid: true, message: '' };
};

// Phone validation
export const validatePhone = (phone) => {
	const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
	if (!phone) return { isValid: false, message: 'Phone number is required' };
	if (!phoneRegex.test(phone.replace(/\s/g, ''))) return { isValid: false, message: 'Please enter a valid phone number' };
	return { isValid: true, message: '' };
};

// Name validation
export const validateName = (name) => {
	if (!name) return { isValid: false, message: 'Name is required' };
	if (name.length < 2) return { isValid: false, message: 'Name must be at least 2 characters' };
	if (name.length > 50) return { isValid: false, message: 'Name must be less than 50 characters' };
	return { isValid: true, message: '' };
};

// Number validation
export const validateNumber = (value, min = 1, max = 1000) => {
	if (!value) return { isValid: false, message: 'This field is required' };
	const num = parseInt(value);
	if (isNaN(num)) return { isValid: false, message: 'Please enter a valid number' };
	if (num < min) return { isValid: false, message: `Value must be at least ${min}` };
	if (num > max) return { isValid: false, message: `Value must be less than ${max}` };
	return { isValid: true, message: '' };
};

// Price validation
export const validatePrice = (price) => {
	if (!price) return { isValid: false, message: 'Price is required' };
	const num = parseFloat(price);
	if (isNaN(num)) return { isValid: false, message: 'Please enter a valid price' };
	if (num <= 0) return { isValid: false, message: 'Price must be greater than 0' };
	if (num > 100000) return { isValid: false, message: 'Price must be less than $100,000' };
	return { isValid: true, message: '' };
};

// Date validation
export const validateDate = (date) => {
	if (!date) return { isValid: false, message: 'Date is required' };
	const selectedDate = new Date(date);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	if (selectedDate < today) return { isValid: false, message: 'Date cannot be in the past' };
	
	const maxDate = new Date();
	maxDate.setFullYear(maxDate.getFullYear() + 1);
	if (selectedDate > maxDate) return { isValid: false, message: 'Date cannot be more than 1 year in advance' };
	
	return { isValid: true, message: '' };
};

// Time validation
export const validateTime = (time) => {
	if (!time) return { isValid: false, message: 'Time is required' };
	const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
	if (!timeRegex.test(time)) return { isValid: false, message: 'Please enter a valid time (HH:MM)' };
	return { isValid: true, message: '' };
};

// Required field validation
export const validateRequired = (value, fieldName) => {
	if (!value || value.toString().trim() === '') {
		return { isValid: false, message: `${fieldName} is required` };
	}
	return { isValid: true, message: '' };
};

// Text length validation
export const validateTextLength = (text, min = 0, max = 1000, fieldName = 'Text') => {
	if (!text) return { isValid: false, message: `${fieldName} is required` };
	if (text.length < min) return { isValid: false, message: `${fieldName} must be at least ${min} characters` };
	if (text.length > max) return { isValid: false, message: `${fieldName} must be less than ${max} characters` };
	return { isValid: true, message: '' };
};

// URL validation
export const validateUrl = (url) => {
	if (!url) return { isValid: true, message: '' }; // URL is optional
	const urlRegex = /^https?:\/\/.+/;
	if (!urlRegex.test(url)) return { isValid: false, message: 'Please enter a valid URL starting with http:// or https://' };
	return { isValid: true, message: '' };
};

// Package capacity validation
export const validateCapacity = (capacity) => {
	if (!capacity) return { isValid: false, message: 'Maximum capacity is required' };
	const num = parseInt(capacity);
	if (isNaN(num)) return { isValid: false, message: 'Please enter a valid number' };
	if (num < 1) return { isValid: false, message: 'Capacity must be at least 1' };
	if (num > 100) return { isValid: false, message: 'Capacity cannot exceed 100' };
	return { isValid: true, message: '' };
};

// Passenger count validation
export const validatePassengerCount = (count, maxCapacity = 100) => {
	if (!count) return { isValid: false, message: 'Number of passengers is required' };
	const num = parseInt(count);
	if (isNaN(num)) return { isValid: false, message: 'Please enter a valid number' };
	if (num < 1) return { isValid: false, message: 'At least 1 passenger is required' };
	if (num > maxCapacity) return { isValid: false, message: `Cannot exceed maximum capacity of ${maxCapacity}` };
	return { isValid: true, message: '' };
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
	const errors = {};
	let isValid = true;

	Object.keys(validationRules).forEach(field => {
		const rule = validationRules[field];
		const value = formData[field];
		
		let result = { isValid: true, message: '' };
		
		// Apply validation based on rule type
		switch (rule.type) {
			case 'required':
				result = validateRequired(value, rule.fieldName || field);
				break;
			case 'email':
				result = validateEmail(value);
				break;
			case 'phone':
				result = validatePhone(value);
				break;
			case 'name':
				result = validateName(value);
				break;
			case 'number':
				result = validateNumber(value, rule.min, rule.max);
				break;
			case 'price':
				result = validatePrice(value);
				break;
			case 'date':
				result = validateDate(value);
				break;
			case 'time':
				result = validateTime(value);
				break;
			case 'textLength':
				result = validateTextLength(value, rule.min, rule.max, rule.fieldName);
				break;
			case 'url':
				result = validateUrl(value);
				break;
			case 'capacity':
				result = validateCapacity(value);
				break;
			case 'passengerCount':
				result = validatePassengerCount(value, rule.maxCapacity);
				break;
			default:
				result = validateRequired(value, rule.fieldName || field);
		}
		
		if (!result.isValid) {
			errors[field] = result.message;
			isValid = false;
		}
	});

	return { isValid, errors };
};

// Real-time validation hook
export const useRealTimeValidation = (validationRules = {}) => {
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});

	const validateField = (field, value) => {
		const rule = validationRules[field];
		if (!rule) return;

		let result = { isValid: true, message: '' };
		
		switch (rule.type) {
			case 'required':
				result = validateRequired(value, rule.fieldName || field);
				break;
			case 'email':
				result = validateEmail(value);
				break;
			case 'phone':
				result = validatePhone(value);
				break;
			case 'name':
				result = validateName(value);
				break;
			case 'number':
				result = validateNumber(value, rule.min, rule.max);
				break;
			case 'price':
				result = validatePrice(value);
				break;
			case 'date':
				result = validateDate(value);
				break;
			case 'time':
				result = validateTime(value);
				break;
			case 'textLength':
				result = validateTextLength(value, rule.min, rule.max, rule.fieldName);
				break;
			case 'url':
				result = validateUrl(value);
				break;
			case 'capacity':
				result = validateCapacity(value);
				break;
			case 'passengerCount':
				result = validatePassengerCount(value, rule.maxCapacity);
				break;
		}

		setErrors(prev => ({
			...prev,
			[field]: result.isValid ? '' : result.message
		}));
	};

	const handleBlur = (field, value) => {
		setTouched(prev => ({ ...prev, [field]: true }));
		validateField(field, value);
	};

	const handleChange = (field, value) => {
		if (touched[field]) {
			validateField(field, value);
		}
	};

	const isFieldValid = (field) => {
		return !errors[field] || errors[field] === '';
	};

	const isFormValid = () => {
		return Object.values(errors).every(error => !error || error === '');
	};

	const clearError = (field) => {
		setErrors(prev => ({
			...prev,
			[field]: ''
		}));
	};

	return {
		errors,
		touched,
		handleBlur,
		handleChange,
		isFieldValid,
		isFormValid,
		setTouched,
		clearError,
		validateField
	};
};
