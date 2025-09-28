import React, { useState } from 'react';
import axios from 'axios';
import './CSS/LoginSignup.css';
import Notification from '../Components/Notification/Notification';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LoginSignup = () => {
  const [state, setState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'Customer',
    address: {
      state: '',
      city: '',
      street: '',
      zip: ''
    },
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState('success');

  const navigate = useNavigate();
  const location = useLocation();

  const showNotification = (message, type = 'success') => {
    setNotifMsg(message);
    setNotifType(type);
    setTimeout(() => setNotifMsg(''), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('address.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (state === "Change Password") {
      try {
        const token = localStorage.getItem('auth-token');
        await axios.put(`${API_BASE_URL}/users/change-password`, passwordData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        showNotification('Password changed successfully!', 'success');
        setState('Login');
      } catch (error) {
        showNotification(error.response?.data?.error || "Error changing password.", 'error');
      }
    } else {
      if (state === "Sign Up" && !agreeTerms) {
        showNotification('You must agree to the terms and conditions.', 'error');
        return;
      }

      try {
        const url = state === "Login"
          ? `${API_BASE_URL}/api/login`
          : `${API_BASE_URL}/api/signup`;

        const payload = { ...formData };

        const response = await axios.post(url, payload);
        localStorage.setItem('auth-token', response.data.token);
        showNotification(`${state} successful!`, 'success');

        setTimeout(() => {
          // Check if user came from "Buy Now"
          if (location.state?.product) {
            // Go directly to order page with product
            navigate('/order-now', { state: { product: location.state.product } });
          } else if (location.state?.from) {
            // Redirect back to original page
            navigate(location.state.from.pathname, { replace: true });
          } else {
            // Default fallback
            navigate("/", { replace: true });
          }
        }, 1500);
      } catch (error) {
        showNotification(error.response?.data?.error || "An error occurred.", 'error');
      }
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>

        {notifMsg && <Notification message={notifMsg} type={notifType} />}

        <form onSubmit={handleSubmit} className="loginsignup-fields">
          {state === "Sign Up" && (
            <>
              <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
              <input name="phone" placeholder="Phone (start with 0)" value={formData.phone} onChange={handleChange} required />
              <input name="address.state" placeholder="State" value={formData.address.state} onChange={handleChange} required />
              <input name="address.city" placeholder="City" value={formData.address.city} onChange={handleChange} required />
              <input name="address.street" placeholder="Street" value={formData.address.street} onChange={handleChange} required />
              <input name="address.zip" placeholder="ZIP (optional)" value={formData.address.zip} onChange={handleChange} />
            </>
          )}

          {state === "Change Password" ? (
            <>
              <input name="oldPassword" type="password" placeholder="Old Password" value={passwordData.oldPassword} onChange={handlePasswordChange} required />
              <input name="newPassword" type="password" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} required />
            </>
          ) : (
            <>
              <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </>
          )}

          <button type="submit">Continue</button>
        </form>

        {state === "Sign Up" ? (
          <p className="loginsignup-login">Already a member? <span onClick={() => setState("Login")}>Login Here</span></p>
        ) : state === "Login" ? (
          <>
            <p className="loginsignup-login">Create an account? <span onClick={() => setState("Sign Up")}>Click Here</span></p>
            <p className="loginsignup-login">Want to change password? <span onClick={() => setState("Change Password")}>Change Password</span></p>
          </>
        ) : (
          <p className="loginsignup-login">Go back to <span onClick={() => setState("Login")}>Login</span></p>
        )}

        {state !== "Change Password" && (
          <div className="loginsignup-agree">
            <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} />
            <p>By continuing I agree to all terms and conditions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
