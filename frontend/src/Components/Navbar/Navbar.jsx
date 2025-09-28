// FRONTEND: Navbar.jsx
import React, { useState, useContext, useEffect } from 'react';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Fallback assets (avoid require() issues)
import defaultLogo from '../Assets/logo.png';
import defaultCartIcon from '../Assets/cart-icon.png';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Navbar = () => {
  const [menu, setMenu] = useState('');
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('auth-token'));
  const location = useLocation();

  const { getTotalCartItems, saveCartBeforeLogout } = useContext(ShopContext);

  // Utility: handle Cloudinary/full URLs & old relative paths
  const getImageSrc = (value, fallback) => {
    if (!value) return fallback;
    const url = value.startsWith('http') ? value : `${API_BASE_URL}${value}`;
    return `${url}?t=${Date.now()}`; // cache-bust
  };

  // Fetch navbar content
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/content/Navbar`)
      .then((res) => setData(res.data.data || {}))
      .catch((err) => console.error('Navbar content load error:', err));
  }, []);

  // Fetch categories
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/categories/public`)
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error('Category fetch error:', err));
  }, []);

  // Handle token expiration
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiry = decoded.exp * 1000;
        const now = Date.now();

        if (expiry > now) {
          setIsLoggedIn(true);
          const timeout = expiry - now;
          const timer = setTimeout(() => {
            localStorage.removeItem('auth-token');
            setIsLoggedIn(false);
          }, timeout);
          return () => clearTimeout(timer);
        } else {
          localStorage.removeItem('auth-token');
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Token decode error:', err);
        localStorage.removeItem('auth-token');
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await saveCartBeforeLogout();
    } catch (err) {
      console.error('Error saving cart before logout:', err);
    } finally {
      localStorage.removeItem('auth-token');
      setIsLoggedIn(false);
      window.location.replace('/');
    }
  };

  const getActiveMenu = (path) => {
    const currentPath = location.pathname;
    return currentPath === path || currentPath === `/${path}`;
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="navbar desktop-navbar">
        <div className="nav-logo">
          <Link to="/">
            <img
              src={getImageSrc(data.logo, defaultLogo)}
              alt="logo"
            />
          </Link>
          <p>{data.brandText || 'EliteCell'}</p>
        </div>

        <ul className="nav-menu">
          <li onClick={() => setMenu('shop')}>
            <Link to="/" style={{ textDecoration: 'none' }}>Shop</Link>
            {getActiveMenu('/') && <hr />}
          </li>

          {categories.map((cat) => {
            const path = `/${cat.name.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <li key={cat._id} onClick={() => setMenu(cat.name.toLowerCase())}>
                <Link to={path} style={{ textDecoration: 'none' }}>
                  {cat.name}
                </Link>
                {getActiveMenu(path) && <hr />}
              </li>
            );
          })}

          {isLoggedIn && (
            <li onClick={() => setMenu('my-orders')}>
              <Link to="/orders" style={{ textDecoration: 'none' }}>
                My Orders
              </Link>
              {getActiveMenu('/orders') && <hr />}
            </li>
          )}
        </ul>

        <div className="nav-login-cart">
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login">
              <button>Login</button>
            </Link>
          )}

          {/* Desktop cart with badge anchored properly */}
          <Link to="/cart" className="cart-link" aria-label="Cart">
            <img
              src={getImageSrc(data.cart_icon, defaultCartIcon)}
              alt="cart"
            />
            <span className="nav-cart-count">{getTotalCartItems()}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="mobile-navbar">
        <div className="mobile-topbar">
          <Link to="/" className="mobile-logo">
            <img
              src={getImageSrc(data.logo, defaultLogo)}
              alt="Logo"
            />
          </Link>

          <div className="mobile-actions">
            {isLoggedIn ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <Link to="/login">
                <button>Login</button>
              </Link>
            )}

            {isLoggedIn && (
              <Link to="/orders">
                <button>My Orders</button>
              </Link>
            )}

            <Link to="/cart" className="mobile-cart" aria-label="Cart">
              <img
                src={getImageSrc(data.cart_icon, defaultCartIcon)}
                alt="Cart"
              />
              <span className="mobile-cart-count">{getTotalCartItems()}</span>
            </Link>

            <div
              className="menu-icon"
              onClick={() => setMenu(menu === 'open' ? '' : 'open')}
              aria-label="Toggle menu"
            >
              ☰
            </div>
          </div>
        </div>

        {menu === 'open' && (
          <div className="mobile-dropdown">
            {categories.map((cat) => {
              const path = `/${cat.name.toLowerCase().replace(/\s+/g, '-')}`;
              return (
                <Link key={cat._id} to={path} onClick={() => setMenu('')}>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
