import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const VerifyEmail = () => {
  const { currentUser, resendVerificationEmail } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user exists
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Set up an interval to check email verification status
    const interval = setInterval(async () => {
      try {
        // Reload the user to get the latest verification status
        await currentUser.reload();
        const user = auth.currentUser;
        if (user?.emailVerified) {
          clearInterval(interval);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }, 3000); // Check every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [currentUser, navigate]);

  const handleResendEmail = async () => {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setError('Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-gray-600">
          We've sent a verification email to {currentUser?.email}.<br />
          Please check your inbox and verify your email address.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? 'Sending...' : 'Resend verification email'}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 