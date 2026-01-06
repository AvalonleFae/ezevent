import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../assets/icons/ezevent_logo.png';
import '../css/Topbar.css';

export default function Topbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHashClick = (e, hash) => {
    e.preventDefault();
    setIsMenuOpen(false); // Close menu when link is clicked
    if (location.pathname !== '/') {
      // If not on landing page, navigate to landing page first
      window.location.href = `/${hash}`;
    } else {
      // If already on landing page, just scroll
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="topbar">
      <div className="topbar-container">
        <div className="topbar-logo">
          <Link to="/">
            <img src={logoImage} alt="EZEvent Logo" />
          </Link>
        </div>

        <button
          className={`topbar-hamburger ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`topbar-nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="topbar-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <a href="#features" className="topbar-link" onClick={(e) => handleHashClick(e, '#features')}>Events</a>
          <a href="#about" className="topbar-link" onClick={(e) => handleHashClick(e, '#about')}>About Us</a>
          <a href="#contact" className="topbar-link" onClick={(e) => handleHashClick(e, '#contact')}>Contact Us</a>
          <Link to="/login" className="topbar-link topbar-link-primary" onClick={() => setIsMenuOpen(false)}>Log In / Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}

