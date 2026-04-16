/**
 * SIGNUP PAGE
 * Multi-step user registration with enhanced UI matching Login page
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/helpers';
import { ROUTES, IMAGES } from '../constants';
import { Button, Input, Card } from '../components/common';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiCheck,
  FiXCircle,
  FiShield,
  FiMapPin
} from 'react-icons/fi';
import { FaMotorcycle, FaUserFriends } from 'react-icons/fa';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: FiUser, description: 'Tell us about yourself' },
  { id: 2, title: 'Bike Status', icon: FaMotorcycle, description: 'Do you own a bike?' },
  { id: 3, title: 'Security', icon: FiShield, description: 'Secure your account' },
];

export const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [createdUserName, setCreatedUserName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    hasBike: null,
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (error) {
      setError('');
      setErrorType('');
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = 'Full name is required';
      } else if (formData.name.length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
      
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!formData.phone) {
        errors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    if (step === 2) {
      if (formData.hasBike === null) {
        errors.hasBike = 'Please select an option';
      }
    }
    
    if (step === 3) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password must contain at least one letter and one number';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.acceptTerms) {
        errors.acceptTerms = 'You must accept the terms';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const parseErrorMessage = (errorMsg) => {
    if (!errorMsg) return { type: 'general', message: 'An error occurred' };
    
    const lowerMsg = errorMsg.toLowerCase();
    
    if (lowerMsg.includes('email') && (lowerMsg.includes('already') || lowerMsg.includes('exists'))) {
      return { type: 'email', message: 'This email is already registered. Please use a different email or login.' };
    }
    
    if (lowerMsg.includes('phone') && (lowerMsg.includes('already') || lowerMsg.includes('exists'))) {
      return { type: 'phone', message: 'This phone number is already registered. Please use a different phone number.' };
    }
    
    return { type: 'general', message: errorMsg };
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    
    if (!validateStep(3)) return;
    
    setLoading(true);
    
    const signupData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.replace(/\D/g, ''),
      address: formData.address.trim(),
      password: formData.password,
      hasBike: formData.hasBike,
      acceptTerms: formData.acceptTerms,
    };
    
    try {
      const result = await signup(signupData);
      
      if (result.success) {
        setCreatedUserName(formData.name.split(' ')[0]);
        setSignupSuccess(true);
        
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: `Welcome ${formData.name.split(' ')[0]}! Your account has been created successfully. Please login.`,
              email: formData.email 
            } 
          });
        }, 2000);
      } else {
        const parsedError = parseErrorMessage(result.error);
        
        setError(parsedError.message);
        setErrorType(parsedError.type);
        
        if (parsedError.type === 'email' || parsedError.type === 'phone') {
          setCurrentStep(1);
          if (parsedError.type === 'email') {
            setFieldErrors(prev => ({ ...prev, email: parsedError.message }));
          } else if (parsedError.type === 'phone') {
            setFieldErrors(prev => ({ ...prev, phone: parsedError.message }));
          }
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      setErrorType('general');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };
  
  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in">
      <Input
        name="name"
        type="text"
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={handleChange}
        error={fieldErrors.name}
        leftIcon={<FiUser className="w-5 h-5" />}
        disabled={loading}
        required
        autoFocus
      />
      
      <Input
        name="email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        error={fieldErrors.email}
        leftIcon={<FiMail className="w-5 h-5" />}
        disabled={loading}
        required
      />
      
      <Input
        name="phone"
        type="tel"
        label="Phone Number"
        placeholder="Enter 10-digit phone number"
        value={formData.phone}
        onChange={handleChange}
        error={fieldErrors.phone}
        leftIcon={<FiPhone className="w-5 h-5" />}
        disabled={loading}
        required
      />
      
      <Input
        name="address"
        type="text"
        label="Address (Optional)"
        placeholder="Enter your city or area"
        value={formData.address}
        onChange={handleChange}
        leftIcon={<FiMapPin className="w-5 h-5" />}
        disabled={loading}
      />
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-4 animate-fade-in">
      <p className="text-gray-300 mb-4 text-center">Do you own a bike?</p>
      
      <div className="space-y-3">
        <label className={cn(
          'flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all',
          'hover:shadow-lg hover:scale-[1.02]',
          formData.hasBike === true 
            ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-lg shadow-primary/20' 
            : 'border-dark-border hover:border-gray-500'
        )}>
          <input
            type="radio"
            name="hasBike"
            value={true}
            checked={formData.hasBike === true}
            onChange={() => setFormData(prev => ({ ...prev, hasBike: true }))}
            disabled={loading}
            className="w-5 h-5 text-primary focus:ring-primary"
          />
          <div className="ml-4">
            <p className="font-semibold text-white text-lg flex items-center gap-2">
              <FaMotorcycle className="text-primary" />
              Yes, I own a bike
            </p>
            <p className="text-sm text-gray-400 mt-1">You can create and offer rides to others</p>
          </div>
        </label>
        
        <label className={cn(
          'flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all',
          'hover:shadow-lg hover:scale-[1.02]',
          formData.hasBike === false 
            ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-lg shadow-primary/20' 
            : 'border-dark-border hover:border-gray-500'
        )}>
          <input
            type="radio"
            name="hasBike"
            value={false}
            checked={formData.hasBike === false}
            onChange={() => setFormData(prev => ({ ...prev, hasBike: false }))}
            disabled={loading}
            className="w-5 h-5 text-primary focus:ring-primary"
          />
          <div className="ml-4">
            <p className="font-semibold text-white text-lg flex items-center gap-2">
              <FaUserFriends className="text-primary" />
              No, I need a ride
            </p>
            <p className="text-sm text-gray-400 mt-1">You can join rides as a passenger</p>
          </div>
        </label>
      </div>
      
      {fieldErrors.hasBike && (
        <p className="text-sm text-error flex items-center gap-1 mt-2">
          <FiAlertCircle className="w-4 h-4" />
          {fieldErrors.hasBike}
        </p>
      )}
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-4 animate-fade-in">
      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="Create a strong password"
        value={formData.password}
        onChange={handleChange}
        error={fieldErrors.password}
        leftIcon={<FiLock className="w-5 h-5" />}
        helperText="At least 8 characters with letters and numbers"
        disabled={loading}
        required
      />
      
      <Input
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={fieldErrors.confirmPassword}
        leftIcon={<FiLock className="w-5 h-5" />}
        disabled={loading}
        required
      />
      
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mt-4">
        <p className="text-sm text-gray-300 flex items-start gap-2">
          <FiShield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <span>Your password should be strong and unique to keep your account secure.</span>
        </p>
      </div>
      
      <label className="flex items-start gap-3 cursor-pointer mt-4 p-3 rounded-lg hover:bg-dark-bg/30 transition-colors">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleChange}
          disabled={loading}
          className="w-5 h-5 mt-0.5 rounded border-dark-border bg-dark-bg text-primary focus:ring-primary"
        />
        <span className="text-sm text-gray-300">
          I agree to the{' '}
          <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
        </span>
      </label>
      
      {fieldErrors.acceptTerms && (
        <p className="text-sm text-error flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4" />
          {fieldErrors.acceptTerms}
        </p>
      )}
    </div>
  );
  
  // Success Screen
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
              <FaMotorcycle className="w-16 h-16 text-primary relative z-10 mx-auto" />
            </div>
          </div>
          
          <Card className="glass-card animate-slide-up">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                <FiCheck className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Account Created!</h2>
              <p className="text-gray-300 mb-1 text-lg">Welcome {createdUserName}!</p>
              <p className="text-gray-400 text-sm mb-6">Your account has been created successfully.</p>
              <p className="text-gray-400 text-sm mb-4">Redirecting to login page...</p>
              
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              
              <Button 
                variant="primary"
                className="btn-gradient"
                onClick={() => navigate('/login', { 
                  state: { 
                    message: `Welcome ${createdUserName}! Your account has been created successfully. Please login.`,
                    email: formData.email 
                  } 
                })}
              >
                Go to Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
            <FaMotorcycle className="w-16 h-16 text-primary relative z-10 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">
            Join <span className="gradient-text">Travel Throttle</span>
          </h1>
          <p className="text-gray-400">Create your account and start riding together</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                      isCompleted && 'bg-primary text-white shadow-lg shadow-primary/30',
                      isActive && 'bg-primary/20 text-primary ring-2 ring-primary',
                      !isActive && !isCompleted && 'bg-dark-border text-gray-400'
                    )}>
                      {isCompleted ? <FiCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={cn(
                      'text-xs mt-2 font-medium',
                      isCompleted || isActive ? 'text-white' : 'text-gray-500'
                    )}>
                      {step.title}
                    </span>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2',
                      isCompleted ? 'bg-primary' : 'bg-dark-border'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-400 mt-3">
            {STEPS[currentStep - 1].description}
          </p>
        </div>
        
        {/* Signup Card */}
        <Card className="glass-card">
          {/* Duplicate Email Error */}
          {errorType === 'email' && (
            <div className="mb-6 p-4 bg-error/10 border-2 border-error rounded-xl">
              <div className="flex items-start gap-3">
                <FiXCircle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-error font-bold text-lg mb-1">Email Already Registered</p>
                  <p className="text-gray-300 mb-3">{error}</p>
                  <Link 
                    to="/login" 
                    state={{ email: formData.email }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                  >
                    Go to Login Instead <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Duplicate Phone Error */}
          {errorType === 'phone' && (
            <div className="mb-6 p-4 bg-error/10 border-2 border-error rounded-xl">
              <div className="flex items-start gap-3">
                <FiXCircle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-error font-bold text-lg mb-1">Phone Number Already Registered</p>
                  <p className="text-gray-300 mb-3">{error}</p>
                  <p className="text-sm text-gray-400">
                    Please use a different phone number or{' '}
                    <Link to="/login" className="text-primary hover:underline font-medium">
                      login to your existing account
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* General Error */}
          {errorType === 'general' && error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-xl flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          
          <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  leftIcon={<FiArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  disabled={loading}
                  rightIcon={<FiArrowRight className="w-4 h-4" />}
                  fullWidth={currentStep === 1}
                  className={cn('btn-gradient', currentStep > 1 && 'flex-1')}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  className="btn-gradient"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
            </div>
          </form>
          
          {/* Login Link */}
          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link 
              to={ROUTES.PUBLIC.LOGIN.path}
              className="text-primary hover:text-primary-light font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;