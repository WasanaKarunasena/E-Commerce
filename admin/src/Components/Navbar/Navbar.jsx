import React, { useState, useEffect } from 'react';
import './Navbar.css';
import navlogo from '../../assets/nav-logo.svg';
import navProfile from '../../assets/nav-profile.svg';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper to check if token is expired
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp; // exp in seconds since epoch
      if (!exp) return true; // no exp means no expiry, treat as valid
      return Date.now() < exp * 1000; // current time < expiry time
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(isTokenValid(token));

    // Optional: Set interval to auto-logout when token expires
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!isTokenValid(token)) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }, 60 * 1000); // every 1 minute

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.reload();
  };

  const handleLogin = () => {
    window.location.href = '/login'; 
  };

  return (
    <div className="navbar">
      <img src={navlogo} alt="Logo" className="nav-logo" />
      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <img src={navProfile} alt="Profile" className="nav-profile" />
            <button className="nav-logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="nav-login-button" onClick={handleLogin}>
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
