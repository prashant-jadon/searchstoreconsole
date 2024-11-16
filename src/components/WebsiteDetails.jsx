import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, WEBSITE_CATEGORIES } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const WebsiteDetails = () => {
  const { uniqueName } = useParams();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        // Search through all categories to find the website
        for (const category of WEBSITE_CATEGORIES) {
          const websiteRef = collection(db, category);
          const q = query(websiteRef, where('uniqueName', '==', uniqueName));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const websiteData = {
              id: querySnapshot.docs[0].id,
              ...querySnapshot.docs[0].data(),
              category
            };
            setWebsite(websiteData);
            break;
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching website details:', error);
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [uniqueName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Website not found</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={website.icon}
          alt={website.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{website.name}</h1>
          <p className="text-gray-500">{website.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-gray-600">{website.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Developer Information</h2>
            <p className="text-gray-600">Name: {website.developer.name}</p>
            <p className="text-gray-600">Email: {website.developer.email}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Details</h2>
            <p className="text-gray-600">Monetization: {website.monetization}</p>
            <p className="text-gray-600">Unique Name: {website.uniqueName}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Website Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {website.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${website.name} screenshot ${index + 1}`}
                className="rounded-lg object-cover w-full h-48"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteDetails; 