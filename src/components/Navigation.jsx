import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <nav>
      {/* ... other navigation items ... */}
      {isAdmin && (
        <Link 
          to="/admin/dashboard"
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Admin Dashboard
        </Link>
      )}
    </nav>
  );
};

export default Navigation; 