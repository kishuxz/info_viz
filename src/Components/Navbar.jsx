import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status using authService
  useEffect(() => {
    const updateAuthState = () => {
      const authenticated = authService.isAuthenticated();
      setIsLoggedIn(authenticated);
    };

    // Initial check
    updateAuthState();

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((isAuth) => {
      setIsLoggedIn(isAuth);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    navigate('/');
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

        {/* Navigation Links */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>

          {/* Learn Dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setIsLearnDropdownOpen(true)}
            onMouseLeave={() => setIsLearnDropdownOpen(false)}
          >
            <button className="dropdown-toggle">
              Learn
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px', opacity: 0.7 }}>
                <polyline points="3 4.5 6 7.5 9 4.5"></polyline>
              </svg>
            </button>
            <div className={`dropdown-menu ${isLearnDropdownOpen ? 'show' : ''}`}>
              <Link to="/learn/getting-started" className="dropdown-item">
                Getting Started
              </Link>
              <Link to="/learn/form-creation" className="dropdown-item">
                Form Creation
              </Link>
              <Link to="/learn/nodes-edges" className="dropdown-item">
                Nodes & Edges
              </Link>
              <Link to="/learn/export" className="dropdown-item">
                Export Guide
              </Link>
              <Link to="/learn/examples" className="dropdown-item">
                Use Cases
              </Link>
              <Link to="/learn/faq" className="dropdown-item">
                FAQ
              </Link>
            </div>
          </div>

          {/* Show Analytics link only when logged in */}
          {isLoggedIn && (
            <Link to="/analytics" className="nav-link">Analytics</Link>
          )}

          {/* Always show Features and GitHub */}
          <a href="/#three-steps" className="nav-link">Features</a>
          <a href="https://github.com/kishuxz/info_viz" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
        </div>

        {/* Auth Section */}
        <div className={`navbar-auth ${isMobileMenuOpen ? 'active' : ''}`}>
          {isLoggedIn ? (
            <>
              <Link to="/admin" className="admin-profile-link">
                <div className="admin-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span className="admin-name">Admin</span>
              </Link>
              <button className="auth-btn login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="auth-btn login-btn">Log In</button>
              </Link>
              <Link to="/signup">
                <button className="auth-btn signup-btn">Sign Up</button>
              </Link>
            </>
          )}
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
