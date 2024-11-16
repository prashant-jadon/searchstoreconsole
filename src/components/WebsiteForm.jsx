import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { uploadToGithub } from '../services/github';

const WebsiteForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({
    icon: null,
    images: []
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: null,
    images: [],
    monetization: 'Free',
    link: '',
    developer: {
      name: '',
      email: ''
    },
    category: ''
  });

  const categories = ['games', 'tools', 'education', 'business'];
  const monetizationTypes = ['Free', 'Paid', 'Freemium'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (type === 'icon') {
      setFormData(prev => ({ ...prev, icon: files[0] }));
      setPreviewUrls(prev => ({
        ...prev,
        icon: URL.createObjectURL(files[0])
      }));
    } else {
      setFormData(prev => ({ ...prev, images: files }));
      const imageUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => ({
        ...prev,
        images: imageUrls
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const uniqueName = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      // Upload icon
      const iconUrl = await uploadToGithub(
        formData.icon,
        `websites/${uniqueName}/icon/${formData.icon.name}`
      );

      // Upload images
      const imageUrls = await Promise.all(
        formData.images.map(image =>
          uploadToGithub(
            image,
            `websites/${uniqueName}/images/${image.name}`
          )
        )
      );

      // Save to Firestore
      const websiteData = {
        ...formData,
        icon: iconUrl,
        images: imageUrls,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      await addDoc(collection(db, formData.category), websiteData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding website:', error);
      alert('Error adding website. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Add New Website</h2>
        <p className="login-subtitle">Fill in the details about your website. All fields marked with * are required.</p>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Basic Information */}
          <div className="input-group">
            <label className="text-sm font-medium text-gray-700">Website Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          {/* Icon Upload */}
          <div className="input-group">
            <label className="text-sm font-medium text-gray-700">Website Icon *</label>
            <div className="flex items-center">
              {previewUrls.icon && (
                <img
                  src={previewUrls.icon}
                  alt="Icon preview"
                  className="h-12 w-12 object-cover rounded-md mr-4"
                />
              )}
              <input
                type="file"
                accept="image/*"
                required={!formData.icon}
                onChange={(e) => handleFileChange(e, 'icon')}
                className="input-field"
              />
            </div>
          </div>

          {/* Screenshots Upload */}
          <div className="input-group">
            <label className="text-sm font-medium text-gray-700">Screenshots *</label>
            <input
              type="file"
              multiple
              accept="image/*"
              required={formData.images.length === 0}
              onChange={(e) => handleFileChange(e, 'images')}
              className="input-field"
            />
            {previewUrls.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {previewUrls.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Category and Monetization */}
          <div className="grid grid-cols-2 gap-6">
            <div className="input-group">
              <label className="text-sm font-medium text-gray-700">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="text-sm font-medium text-gray-700">Monetization</label>
              <select
                name="monetization"
                value={formData.monetization}
                onChange={handleInputChange}
                className="input-field"
              >
                {monetizationTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Developer Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="input-group">
              <label className="text-sm font-medium text-gray-700">Developer Name *</label>
              <input
                type="text"
                name="developer.name"
                required
                value={formData.developer.name}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="text-sm font-medium text-gray-700">Developer Email *</label>
              <input
                type="email"
                name="developer.email"
                required
                value={formData.developer.email}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Website URL */}
          <div className="input-group">
            <label className="text-sm font-medium text-gray-700">Website URL *</label>
            <input
              type="url"
              name="link"
              required
              value={formData.link}
              onChange={handleInputChange}
              placeholder="https://"
              className="input-field"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`submit-button ${isSubmitting ? 'button-disabled' : ''}`}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebsiteForm;
