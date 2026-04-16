/**
 * LOGIN PAGE
 * Enhanced with phone/email toggle
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, IMAGES } from '../constants';
import { Button, Input, Card } from '../components/common';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, 
  FiCheckCircle, FiArrowRight, FiPhone 
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Enable after adding credentials

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    phone: '',
    password: '',
    rememberMe: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (loginMethod === 'email') {
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    } else {
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const identifier = loginMethod === 'email' ? formData.email : formData.phone;
      const result = await login(identifier, formData.password, formData.rememberMe);
      
      if (result.success) {
        navigate(ROUTES.PROTECTED.DASHBOARD.path);
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fillDemoCredentials = () => {
    setFormData({
      email: 'rahul@travelthrottle.com',
      phone: '',
      password: 'password123',
      rememberMe: true,
    });
    setFieldErrors({});
    setError('');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
            <FaMotorcycle className="w-16 h-16 text-primary relative z-10 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">
            Welcome <span className="gradient-text">Back</span>
          </h1>
          <p className="text-gray-400">Sign in to continue your journey</p>
        </div>
        
        {/* Login Card */}
        <Card className="glass-card animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-xl flex items-start gap-2">
                <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success">{successMessage}</p>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-xl flex items-start gap-2">
                <FiAlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}
            
            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-dark-bg/50 rounded-xl">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === 'email'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiMail className="inline w-4 h-4 mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === 'phone'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiPhone className="inline w-4 h-4 mr-2" />
                Phone
              </button>
            </div>
            
            {/* Email/Phone Input */}
            {loginMethod === 'email' ? (
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
                autoComplete="email"
                autoFocus
              />
            ) : (
              <Input
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                error={fieldErrors.phone}
                leftIcon={<FiPhone className="w-5 h-5" />}
                disabled={loading}
                required
                autoComplete="tel"
                autoFocus
              />
            )}
            
            {/* Password Input */}
            <div>
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                leftIcon={<FiLock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none text-gray-400 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                }
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 rounded border-dark-border bg-dark-bg text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">Remember me</span>
              </label>
              
              <Link 
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="btn-gradient w-full py-3 text-base"
              loading={loading}
              rightIcon={<FiArrowRight className="w-5 h-5" />}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            {/* Demo Credentials */}
            {import.meta.env.DEV && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                fullWidth
                onClick={fillDemoCredentials}
              >
                Use Demo Credentials
              </Button>
            )}
          </form>
          
          {/* Sign Up Link */}
          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link 
              to={ROUTES.PUBLIC.SIGNUP.path}
              className="text-primary hover:text-primary-light font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;