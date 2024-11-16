import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/UserDashboard.css';

const UserDashboard = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserWebsites();
  }, [currentUser]);

  const fetchUserWebsites = async () => {
    try {
      const allWebsites = [];
      const categories = ['games', 'tools', 'education', 'business'];

      for (const category of categories) {
        const websiteRef = collection(db, category);
        const q = query(websiteRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          allWebsites.push({
            id: doc.id,
            ...doc.data(),
            category,
          });
        });
      }

      setWebsites(allWebsites);
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWebsites = selectedCategory === 'all' 
    ? websites 
    : websites.filter(website => website.category === selectedCategory);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>My Websites</h1>
        <button
          onClick={() => navigate('/add')}
          className="add-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Website
        </button>
      </div>

      {/* Category Filters */}
      <div className="category-filter">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`filter-button ${
            selectedCategory === 'all' ? 'active' : ''
          }`}
        >
          All
        </button>
        {['games', 'tools', 'education', 'business'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-button ${
              selectedCategory === category ? 'active' : ''
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Websites List */}
      {filteredWebsites.length > 0 ? (
        <div className="websites-list">
          {filteredWebsites.map((website) => (
            <div className="website-card" key={website.id}>
              {/* Icon */}
              <img
                src={website.icon || 'https://via.placeholder.com/64'}
                alt={website.name}
                className="website-icon"
              />

              {/* Content */}
              <div className="website-content">
                <h3 className="website-title">{website.name}</h3>
                <p className="website-category">{website.category}</p>
                <p className="website-description">{website.description}</p>
              </div>

              {/* Visit Button */}
              <a
                href={website.link}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-button"
              >
                Visit
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3>No websites</h3>
          <p>Get started by adding a new website.</p>
        </div>
      )}

      {/* Logout Button */}
      <div className="logout-button-container">
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
