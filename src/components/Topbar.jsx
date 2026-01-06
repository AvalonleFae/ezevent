import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../assets/icons/ezevent_logo.png';
import '../css/Topbar.css';

export default function Topbar() {
  const location = useLocation();

  const handleHashClick = (e, hash) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      window.location.href = `/${hash}`;
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-container">
        <div className="topbar-logo">
          <Link to="/">
            <img src={logoImage} alt="EZEvent Logo" />
          </Link>
        </div>
        <nav className="topbar-nav">
          <Link to="/" className="topbar-link">Home</Link>
          <a href="#features" className="topbar-link" onClick={(e) => handleHashClick(e, '#features')}>Events</a>
          <a href="#about" className="topbar-link" onClick={(e) => handleHashClick(e, '#about')}>About Us</a>
          <a href="#contact" className="topbar-link" onClick={(e) => handleHashClick(e, '#contact')}>Contact Us</a>
          <Link to="/login" className="topbar-link topbar-link-primary">Log In / Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}
