import React, { useState, useEffect } from 'react';
import { db, WEBSITE_CATEGORIES } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const WebsiteList = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        let allWebsites = [];
        
        if (selectedCategory === 'All') {
          // Fetch from all categories
          for (const category of WEBSITE_CATEGORIES) {
            const querySnapshot = await getDocs(collection(db, category));
            const categoryWebsites = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              category
            }));
            allWebsites = [...allWebsites, ...categoryWebsites];
          }
        } else {
          // Fetch from selected category only
          const querySnapshot = await getDocs(collection(db, selectedCategory));
          allWebsites = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            category: selectedCategory
          }));
        }

        setWebsites(allWebsites);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching websites:', error);
        setLoading(false);
      }
    };

    fetchWebsites();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Websites</h1>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Categories</option>
          {WEBSITE_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map(website => (
          <Link
            key={website.uniqueName}
            to={`/website/${website.uniqueName}`}
            className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={website.icon}
                  alt={website.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold">{website.name}</h2>
                  <p className="text-sm text-gray-500">{website.category}</p>
                </div>
              </div>
              <p className="mt-2 text-gray-600 line-clamp-2">{website.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">{website.developer.name}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {website.monetization}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {websites.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No websites found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default WebsiteList; 