/**
 * LOGIN PAGE - Modern Redesign
 * Professional authentication page with smooth animations
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import { Button, Card } from '../components/common';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, 
  FiCheckCircle, FiArrowRight, FiPhone, FiLogIn
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

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
    setSuccessMessage('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const identifier = loginMethod === 'email' 
        ? formData.email.toLowerCase().trim() 
        : formData.phone.replace(/\D/g, '');
      
      const result = await login(identifier, formData.password, formData.rememberMe);
      
      if (result.success) {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate(ROUTES.PROTECTED.DASHBOARD.path);
        }, 1000);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-2xl opacity-50 animate-pulse-slow" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
              <FaMotorcycle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-heading text-white mt-6 mb-2">
            Welcome <span className="gradient-text">Back</span>
          </h1>
          <p className="text-text-secondary">Sign in to continue your journey</p>
        </div>
        
        {/* Login Card */}
        <Card className="glass-card p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-success/10 backdrop-blur-sm border border-success/30 rounded-xl flex items-start gap-3 animate-slide-down">
                <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success">{successMessage}</p>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-error/10 backdrop-blur-sm border border-error/30 rounded-xl flex items-start gap-3 animate-slide-down">
                <FiAlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}
            
            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1.5 bg-dark-bg/50 backdrop-blur-sm rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  loginMethod === 'email'
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <FiMail className="inline w-4 h-4 mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  loginMethod === 'phone'
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <FiPhone className="inline w-4 h-4 mr-2" />
                Phone
              </button>
            </div>
            
            {/* Email/Phone Input */}
            <div>
              {loginMethod === 'email' ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark-bg-tertiary border-2 border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 pl-12"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-error text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> {fieldErrors.email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark-bg-tertiary border-2 border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 pl-12"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-error text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> {fieldErrors.phone}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-secondary">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-light transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-bg-tertiary border-2 border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 pl-12 pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-error text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}
            </div>
            
            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 rounded border-dark-border bg-dark-bg text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-text-secondary group-hover:text-white transition-colors">
                Remember me for 30 days
              </span>
            </label>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 py-3.5 rounded-xl font-semibold text-base transform hover:scale-[1.02]"
              loading={loading}
            >
              {loading ? (
                <>Signing in...</>
              ) : (
                <>
                  Sign In
                  <FiLogIn className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            {/* Demo Credentials (Dev Only) */}
            {import.meta.env.DEV && (
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={fillDemoCredentials}
                className="mt-3"
              >
                Use Demo Credentials
              </Button>
            )}
          </form>
          
          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <Link 
                to={ROUTES.PUBLIC.SIGNUP.path}
                className="text-primary hover:text-primary-light font-semibold transition-colors"
              >
                Create Account
                <FiArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            </p>
          </div>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;