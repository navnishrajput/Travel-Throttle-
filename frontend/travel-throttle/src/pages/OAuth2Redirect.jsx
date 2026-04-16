/**
 * OAUTH2 REDIRECT HANDLER
 * Handles OAuth2 callback from backend
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { STORAGE_KEYS } from '../constants';
import { FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export const OAuth2Redirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reloadUser } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      console.log('=== OAUTH2 REDIRECT ===');
      
      const token = searchParams.get('token');
      const id = searchParams.get('id');
      const name = searchParams.get('name');
      const email = searchParams.get('email');
      const hasBike = searchParams.get('hasBike') === 'true';
      const avatar = searchParams.get('avatar');
      const errorParam = searchParams.get('error');

      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('User:', email);

      if (errorParam) {
        setStatus('error');
        setError('OAuth2 authentication failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (token && email) {
        // Store token and user data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        
        const userData = {
          id,
          name,
          email,
          hasBike,
          avatar: avatar || null,
        };
        
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        localStorage.setItem('tt_remember_me', 'true');
        
        console.log('OAuth2 login successful for:', email);
        
        setStatus('success');
        
        // Reload auth context
        reloadUser();
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatus('error');
        setError('Invalid OAuth2 response');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuth2Redirect();
  }, [searchParams, navigate, reloadUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <FiLoader className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-400">
              Please wait while we complete your authentication...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <FiCheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Successfully Signed In!
            </h2>
            <p className="text-gray-400">
              Redirecting you to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
              <FiXCircle className="w-8 h-8 text-error" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuth2Redirect;