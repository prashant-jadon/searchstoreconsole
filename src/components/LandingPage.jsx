import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <h1>SearchStore</h1>
        <h2>Your Gateway to the Best Websites</h2>
        <p>
          Simplify your browsing experience with curated, high-quality websites 
          tailored to your interests.
        </p>

        {/* Play Store and App Store Links */}
        <div className="store-buttons">
          <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
            <button className="store-button playstore">Download on Play Store</button>
          </a>
          <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
            <button className="store-button appstore">Download on App Store</button>
          </a>
        </div>

        {/* App Preview Image */}
        <div >
          <img src="/assets/bgimage.jpeg" alt="App Preview" />
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>Why SearchStore?</h2>
        <div className="feature-cards">
          {[
            { title: "Curated Selection", description: "Handpicked websites for easy discovery." },
            { title: "Trusted Reviews", description: "Find the most reliable sites through reviews." },
            { title: "PWA Ready", description: "Install websites as apps for offline use." },
            { title: "Smart Recommendations", description: "Suggestions tailored to your interests." },
            { title: "Safety First", description: "Secure, accessible browsing experience." },
            { title: "Bookmark & Save", description: "Save and revisit your favorite sites offline." },
          ].map((feature, index) => (
            <div key={index} className="card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Section */}
      <section className="developer">
        <h2>For Website Owners</h2>
        <p>
          Join SearchStore to showcase your site, connect with users, and track your 
          performance on a dedicated dashboard.
        </p>
        <div className="developer-buttons">
          <button className="primary-button" onClick={() => navigate("/signup")}>
            Get Started
          </button>
          <button className="secondary-button" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
