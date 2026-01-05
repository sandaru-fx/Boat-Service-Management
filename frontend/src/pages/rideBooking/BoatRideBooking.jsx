import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaArrowRight, FaCalendarAlt, FaClock, FaUsers, FaShip, FaMapMarkerAlt, FaDollarSign, FaCheck, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { createBoatRide, checkAvailability, getPricing } from './rideApi';
import { useRealTimeValidation } from '../../utils/validation';

const BoatRideBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Debug: Check if user is logged in
  console.log('Current user:', user);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Ride Details
    duration: 1, // 1 hour default
    passengers: 1,
    boatType: '',
    journeyType: '',
    
    // Step 2: Pricing
    basePrice: 0,
    passengerPrice: 0,
    totalPrice: 0,
    
    // Step 3: Calendly (handled by widget)
    calendlyEventId: '',
    calendlyEventUri: '',
    scheduledDateTime: null,
    
    // Step 4: Additional Information
    specialRequests: '',
    emergencyContact: '',
    
    // Customer info (pre-filled from auth)
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [calendlyScheduled, setCalendlyScheduled] = useState(false);
  
  // Real-time validation
  const validationRules = {
    passengers: { type: 'number', min: 1, max: 100 },
    emergencyContact: { type: 'phone' },
    specialRequests: { type: 'textLength', min: 0, max: 500, fieldName: 'Special requests' }
  };
  
  const { errors, validateField, clearError } = useRealTimeValidation(validationRules);
  
  // Pre-fill customer info from auth
  useEffect(() => {
    console.log('User object:', user);
    if (user && user.name) {
      console.log('Setting customer data:', {
        name: user.name,
        email: user.email,
        phone: user.phone
      });
      setFormData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerEmail: user.email || '',
        customerPhone: user.phone || ''
      }));
    } else {
      console.log('No user or user.name found, user:', user);
    }
  }, [user]);
  
  // Get current boat capacity
  const getCurrentBoatCapacity = () => {
    const selectedBoat = boatTypes.find(boat => boat.type === formData.boatType);
    return selectedBoat ? selectedBoat.capacity : 100; // Default fallback
  };
  
  // Boat types with capacity limits
  const boatTypes = [
    { type: 'Speedboat', capacity: 8 },
    { type: 'Yacht', capacity: 20 },
    { type: 'Catamaran', capacity: 12 },
    { type: 'Fishing Boat', capacity: 6 },
    { type: 'Dinghy', capacity: 4 },
    { type: 'Jet Ski', capacity: 2 }
  ];
  
  const journeyTypes = [
    'Sunset Tour', 'Adventure Tour', 'Island Hopping', 'Snorkeling Adventure',
    'Deep Sea Fishing', 'Romantic Cruise', 'Family Tour', 'Corporate Event',
    'Birthday Party', 'Wedding Proposal'
  ];
  
  // Duration options in 15-minute increments (15min to 6hrs)
  const durationOptions = [
    { value: 0.25, label: '15 minutes' },
    { value: 0.5, label: '30 minutes' },
    { value: 0.75, label: '45 minutes' },
    { value: 1, label: '1 hour' },
    { value: 1.25, label: '1 hour 15 minutes' },
    { value: 1.5, label: '1 hour 30 minutes' },
    { value: 1.75, label: '1 hour 45 minutes' },
    { value: 2, label: '2 hours' },
    { value: 2.25, label: '2 hours 15 minutes' },
    { value: 2.5, label: '2 hours 30 minutes' },
    { value: 2.75, label: '2 hours 45 minutes' },
    { value: 3, label: '3 hours' },
    { value: 3.25, label: '3 hours 15 minutes' },
    { value: 3.5, label: '3 hours 30 minutes' },
    { value: 3.75, label: '3 hours 45 minutes' },
    { value: 4, label: '4 hours' },
    { value: 4.25, label: '4 hours 15 minutes' },
    { value: 4.5, label: '4 hours 30 minutes' },
    { value: 4.75, label: '4 hours 45 minutes' },
    { value: 5, label: '5 hours' },
    { value: 5.25, label: '5 hours 15 minutes' },
    { value: 5.5, label: '5 hours 30 minutes' },
    { value: 5.75, label: '5 hours 45 minutes' },
    { value: 6, label: '6 hours' }
  ];
  
  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error and validate field
    clearError(field);
    validateField(field, value);
  };
  
  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.boatType) newErrors.boatType = 'Boat type is required';
        if (!formData.journeyType) newErrors.journeyType = 'Journey type is required';
        if (formData.passengers < 1) newErrors.passengers = 'At least 1 passenger required';
        if (formData.duration < 0.25) newErrors.duration = 'Duration must be at least 15 minutes';
        break;
        
      case 2:
        if (isLoadingPricing) {
          newErrors.pricing = 'Loading pricing information...';
        } else if (formData.totalPrice <= 0) {
          newErrors.pricing = 'Pricing information is required. Please ensure all ride details are selected.';
        }
        break;
        
      case 3:
        if (!calendlyScheduled) newErrors.calendly = 'Please schedule your ride time using the calendar below';
        break;
        
      case 4:
        if (formData.emergencyContact && !/^[0-9]{10}$/.test(formData.emergencyContact)) {
          newErrors.emergencyContact = 'Please enter a valid 10-digit phone number';
        }
        break;
    }
    
    // Note: Errors are now handled by useRealTimeValidation hook
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle Calendly event scheduled
  const handleCalendlyEventScheduled = (event) => {
    console.log('Calendly event scheduled:', event);
    setFormData(prev => ({
      ...prev,
      calendlyEventId: event.detail.event.uri.split('/').pop(),
      calendlyEventUri: event.detail.event.uri,
      scheduledDateTime: event.detail.event.start_time
    }));
    setCalendlyScheduled(true);
    toast.success('Ride time scheduled successfully!');
  };
  
  // Load pricing
  const loadPricing = useCallback(async () => {
    if (!formData.boatType || !formData.journeyType || !formData.duration || !formData.passengers) {
      return;
    }
    
    try {
      setIsLoadingPricing(true);
      const response = await getPricing(
        formData.boatType,
        formData.journeyType,
        formData.duration,
        formData.passengers
      );
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          basePrice: response.data.basePrice,
          passengerPrice: response.data.passengerPrice,
          totalPrice: response.data.totalPrice
        }));
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
      toast.error('Failed to load pricing information');
    } finally {
      setIsLoadingPricing(false);
    }
  }, [formData.boatType, formData.journeyType, formData.duration, formData.passengers]);
  
  // Load pricing when relevant fields change
  useEffect(() => {
    if (formData.boatType && formData.journeyType && formData.duration && formData.passengers) {
      loadPricing();
    }
  }, [formData.boatType, formData.journeyType, formData.duration, formData.passengers, loadPricing]);

  // Load Calendly script and setup event listeners
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);

    // Add event listener for Calendly events
    const handleCalendlyEvent = (e) => {
      if (e.data.event && e.data.event === 'calendly.event_scheduled') {
        handleCalendlyEventScheduled(e);
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // Navigate to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      // For step 2, ensure pricing is loaded before proceeding
      if (currentStep === 2 && (isLoadingPricing || formData.totalPrice <= 0)) {
        toast.error('Please wait for pricing to load or ensure all ride details are selected');
        return;
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Submit booking
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the booking
      const bookingData = {
        ...formData,
        customerName: formData.customerName || user?.name,
        customerEmail: formData.customerEmail || user?.email,
        customerPhone: formData.customerPhone || user?.phone,
        status: 'pending',
        bookingDate: new Date().toISOString()
      };
      
      const response = await createBoatRide(bookingData);
      
      if (response.success) {
        toast.success('Booking created successfully!');
        navigate(`/ride-confirmation/${response.data.booking._id}`);
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step titles
  const stepTitles = [
    'Ride Details',
    'Pricing & Confirmation',
    'Schedule Your Ride',
    'Payment & Additional Info'
  ];
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaShip className="inline mr-2" />
                  Boat Type *
                </label>
                <select
                  value={formData.boatType}
                  onChange={(e) => updateFormData('boatType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.boatType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select boat type</option>
                  {boatTypes.map(boat => (
                    <option key={boat.type} value={boat.type}>
                      {boat.type} (Max {boat.capacity} passengers)
                    </option>
                  ))}
                </select>
                {errors.boatType && <p className="text-red-500 text-sm mt-1">{errors.boatType}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Journey Type *
                </label>
                <select
                  value={formData.journeyType}
                  onChange={(e) => updateFormData('journeyType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.journeyType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select journey type</option>
                  {journeyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.journeyType && <p className="text-red-500 text-sm mt-1">{errors.journeyType}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUsers className="inline mr-2" />
                  Number of Passengers *
                </label>
                <select
                  value={formData.passengers}
                  onChange={(e) => updateFormData('passengers', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.passengers ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!formData.boatType}
                >
                  <option value="">Select number of passengers</option>
                  {Array.from({ length: getCurrentBoatCapacity() }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'passenger' : 'passengers'}
                    </option>
                  ))}
                </select>
                {errors.passengers && <p className="text-red-500 text-sm mt-1">{errors.passengers}</p>}
                {formData.boatType && (
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum {getCurrentBoatCapacity()} passengers for {formData.boatType}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaClock className="inline mr-2" />
                  Duration *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => updateFormData('duration', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select duration</option>
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
              
              {isLoadingPricing ? (
                <div className="text-center py-4">
                  <FaSpinner className="animate-spin text-2xl text-teal-600 mx-auto mb-2" />
                  <p className="text-gray-600">Loading pricing...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base Price ({formData.boatType} - {formData.journeyType}):</span>
                    <span className="font-semibold">LKR {formData.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passenger Price ({formData.passengers} × LKR {formData.passengerPrice}):</span>
                    <span className="font-semibold">LKR {(formData.passengers * formData.passengerPrice).toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Price:</span>
                    <span className="text-teal-600">LKR {formData.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            
            {errors.pricing && (
              <div className={`p-3 rounded-md ${isLoadingPricing ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm ${isLoadingPricing ? 'text-blue-800' : 'text-red-600'}`}>
                  {isLoadingPricing ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      {errors.pricing}
                    </>
                  ) : (
                    errors.pricing
                  )}
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Payment:</strong> Payment must be completed online using Stripe before your ride can be confirmed. 
                You will be redirected to our secure payment gateway after scheduling your ride.
              </p>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Your Ride</h3>
              <p className="text-gray-600">Select your preferred date and time for the boat ride</p>
            </div>
            
            {errors.calendly && <p className="text-red-500 text-sm text-center">{errors.calendly}</p>}
            
            {/* Calendly Widget */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/your-username/boat-ride-booking"
                style={{ minWidth: '320px', height: '630px' }}
              ></div>
            </div>
            
            {calendlyScheduled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaCheck className="text-green-600 mr-2" />
                  <p className="text-green-800">
                    <strong>Ride scheduled!</strong> Your ride has been scheduled for {formData.scheduledDateTime ? new Date(formData.scheduledDateTime).toLocaleString() : 'the selected time'}.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            {/* Payment Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
              <div className="text-center py-8">
                <div className="text-4xl text-gray-400 mb-4">
                  <FaDollarSign />
                </div>
                <p className="text-gray-600 mb-4">Stripe payment integration will be implemented soon</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Payment must be completed online using Stripe before your ride can be confirmed. 
                    You will be redirected to our secure payment gateway to complete the transaction.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  {formData.customerName || 'Loading...'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  {formData.customerEmail || 'Loading...'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  {formData.customerPhone || 'Loading...'}
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => updateFormData('specialRequests', e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Any special requests or requirements for your ride..."
                maxLength="500"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.specialRequests.length}/500 characters
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter emergency contact number (optional)"
                maxLength="10"
              />
              {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
            </div>
            
            {/* Booking Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Booking Summary</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Boat:</strong> {formData.boatType}</p>
                <p><strong>Journey:</strong> {formData.journeyType}</p>
                <p><strong>Duration:</strong> {durationOptions.find(opt => opt.value === formData.duration)?.label || `${formData.duration} hours`}</p>
                <p><strong>Passengers:</strong> {formData.passengers}</p>
                <p><strong>Total:</strong> LKR {formData.totalPrice.toLocaleString()}</p>
                {formData.scheduledDateTime && (
                  <p><strong>Scheduled:</strong> {new Date(formData.scheduledDateTime).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Boat Ride Booking</h1>
              <p className="text-gray-600">Book your perfect boat ride experience</p>
            </div>
          </div>

          {/* Pricing Guide */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaDollarSign className="mr-2 text-teal-600" />
              Pricing Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Speedboat</h3>
                <p className="text-sm text-gray-600 mb-2">Base: LKR 4,500 - 10,000</p>
                <p className="text-xs text-gray-500">+ LKR 450-1,000 per person per hour</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Yacht</h3>
                <p className="text-sm text-gray-600 mb-2">Base: LKR 7,000 - 20,000</p>
                <p className="text-xs text-gray-500">+ LKR 700-2,000 per person per hour</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Catamaran</h3>
                <p className="text-sm text-gray-600 mb-2">Base: LKR 5,500 - 15,000</p>
                <p className="text-xs text-gray-500">+ LKR 550-1,500 per person per hour</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Fishing Boat</h3>
                <p className="text-sm text-gray-600 mb-2">Base: LKR 2,500 - 8,000</p>
                <p className="text-xs text-gray-500">+ LKR 250-800 per person per hour</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Dinghy</h3>
                <p className="text-sm text-gray-600 mb-2">Base: LKR 1,800 - 5,000</p>
                <p className="text-xs text-gray-500">+ LKR 180-500 per person per hour</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Jet Ski</h3>
                <p className="text-sm text-gray-600 mb-2">Base: LKR 1,200 - 4,000</p>
                <p className="text-xs text-gray-500">+ LKR 120-400 per person per hour</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Prices vary by journey type. Family tours are most affordable, 
                while corporate events and wedding proposals are premium experiences.
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    i + 1 <= currentStep 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {i + 1 < currentStep ? <FaCheck /> : i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      i + 1 < currentStep ? 'bg-teal-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
              </p>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="mr-2" />
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Next
                <FaArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Book Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoatRideBooking;
