import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <circle cx="6" cy="6" r="2" />
              <circle cx="18" cy="6" r="2" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
              <line x1="12" y1="12" x2="6" y2="6" />
              <line x1="12" y1="12" x2="18" y2="6" />
              <line x1="12" y1="12" x2="6" y2="18" />
              <line x1="12" y1="12" x2="18" y2="18" />
            </svg>
          </div>
          <span className="logo-text">NetworkMap</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/analytics" className="nav-link">Dashboard</Link>
          <a href="#three-steps" className="nav-link">Features</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
        </div>

        {/* Auth Buttons */}
        <div className={`navbar-auth ${isMobileMenuOpen ? 'active' : ''}`}>
          <button className="auth-btn login-btn">Log In</button>
          <button className="auth-btn signup-btn">Sign Up</button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}></span>
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}></span>
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
}
