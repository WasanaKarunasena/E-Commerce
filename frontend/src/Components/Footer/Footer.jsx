import React, { useEffect, useState } from 'react';
import './Footer.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Footer = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/content/Footer`)
      .then((res) => setData(res.data.data || {}))
      .catch((err) => console.error('Footer load error:', err));
  }, []);

  const getImg = (key, fallback) => {
    if (!data[key]) return require(`../Assets/${fallback}`);
    // If it's a full URL (Cloudinary or other external), use it directly
    if (data[key].startsWith('http')) return data[key];
    // Otherwise, assume it's a local upload path
    return `${API_BASE_URL}${data[key]}`;
  };

  return (
    <div className="footer">
      <div className="footer-logo">
        <img src={getImg('logo', 'logo.png')} alt="footer-logo" />
        <p>{data.brandText || 'EliteCell'}</p>
      </div>

      <ul className="footer-links">
        <li>{data.link1 || 'Home'}</li>
        <li>{data.link2 || 'Offices'}</li>
        <li>{data.link3 || 'About'}</li>
        <li>{data.link4 || 'Products'}</li>
        <li>{data.link5 || 'Contact'}</li>
      </ul>

      <div className="footer-social-icons">
        {['whatsapp_icon', 'instagram_icon', 'facebook_icon', 'twitter_icon'].map((key) => (
          <div className="footer-icons-container" key={key}>
            <img src={getImg(key, `${key}.png`)} alt={key} />
          </div>
        ))}
      </div>

      <div className="footer-copyright">
        <hr />
        <p>{data.copyright || 'Copyright @ 2025 - All rights reserved'}</p>
      </div>
    </div>
  );
};

export default Footer;
