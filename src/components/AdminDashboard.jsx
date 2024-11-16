import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import '../css/UserDashboard.css'; // Assuming you will apply the same styles

const AdminDashboard = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['games', 'tools', 'education', 'business'];

  useEffect(() => {
    fetchAllWebsites();
  }, []);

  const fetchAllWebsites = async () => {
    try {
      const allWebsites = [];

      for (const category of categories) {
        const websiteRef = collection(db, category);
        const q = query(websiteRef, orderBy('createdAt', 'desc'));
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching websites:', error);
      setLoading(false);
    }
  };

  const filterWebsites = () => {
    let filtered = [...websites];
    const now = new Date();

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((website) => website.category === selectedCategory);
    }

    switch (timeFilter) {
      case 'today':
        const today = new Date(now.setHours(0, 0, 0, 0));
        filtered = filtered.filter((website) => new Date(website.createdAt) >= today);
        break;
      case 'week':
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter((website) => new Date(website.createdAt) >= lastWeek);
        break;
      case 'month':
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter((website) => new Date(website.createdAt) >= lastMonth);
        break;
      default:
        break;
    }

    return filtered;
  };

  const groupedWebsites = filterWebsites();

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
        <h1>Admin Dashboard</h1>
        <p>Monitor and manage websites effectively</p>
      </div>

      {/* Filters */}
      <div className="filter-section">
        {/* Time Filter */}
        <div className="filter-group">
          <span className="filter-label">Filter by Time:</span>
          {['all', 'today', 'week', 'month'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`filter-button ${timeFilter === filter ? 'active' : ''}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Websites Display */}
      {groupedWebsites.length > 0 ? (
        <div className="websites-list">
          {groupedWebsites.map((website) => (
            <div className="website-card" key={website.id}>
              {/* Website Icon */}
              <img
                src={website.icon || 'https://via.placeholder.com/64'}
                alt={website.name}
                className="website-icon"
              />

              {/* Website Content */}
              <div className="website-content">
                <h3 className="website-title">{website.name}</h3>
                <p className="website-category">{website.category}</p>
                <p className="website-description">{website.description}</p>
              </div>

              {/* Website Action */}
              <div className="website-action">
                <span
                  className={`status-badge ${
                    website.status === 'pending' ? 'status-pending' : 'status-approved'
                  }`}
                >
                  {website.status}
                </span>
                <a
                  href={website.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-button"
                >
                  Visit Website
                </a>
              </div>
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
          <h3>No websites found</h3>
          <p>Adjust filters to see more results.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
