import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './OrderForm.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ADMIN_NOTIFY_URL = `${API_BASE_URL}/users/admin/notify`;

const OrderForm = () => {
  const location = useLocation();
  const directProduct = location.state?.product || null;

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');

  useEffect(() => {
    if (!directProduct) {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(cart);
    }
  }, [directProduct]);

  const showCustomNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('auth-token');

    if (!token) {
      showCustomNotification('You must be logged in to place an order.', 'error');
      return;
    }

    const { street, city, state, postalCode } = address;
    if (!street || !city || !state || !postalCode) {
      showCustomNotification('Please fill out the complete shipping address.', 'error');
      return;
    }

    if (!cardNumber || String(cardNumber).replace(/\D/g, '').length < 12) {
      showCustomNotification('Please enter a valid card number.', 'error');
      return;
    }

    const orderItems = directProduct
      ? [{ itemId: directProduct._id, quantity: 1 }]
      : Array.isArray(cartItems)
        ? cartItems.map(item => ({ itemId: item.itemId, quantity: item.quantity }))
        : Object.entries(cartItems).map(([itemId, quantity]) => ({ itemId, quantity }));

    if (orderItems.length === 0) {
      showCustomNotification('No items to order.', 'error');
      return;
    }

    try {
      setLoading(true);

      // 1) Place the order
      const res = await axios.post(
        `${API_BASE_URL}/orders`,
        {
          order_items: orderItems,
          shippingAddress: address,
          paymentMethod,
          paymentDetails: { cardNumber },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderId = res?.data?.order?._id;
      console.log('🧾 Order placed, id =', orderId);

      // 2) Notify admin
      try {
        console.log('🔔 Notifying admin at:', ADMIN_NOTIFY_URL);
        await axios.post(
          ADMIN_NOTIFY_URL,
          {
            orderId,
            message: `A new order has been placed by a customer. Order ID: ${orderId}`,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Admin notified');
      } catch (notifyErr) {
        console.error('⚠️ Failed to notify admin:', notifyErr?.response?.data || notifyErr.message);
        showCustomNotification('Order placed. Admin notification failed (will be retried).', 'error');
      }

      if (!directProduct) localStorage.removeItem('cart');

      showCustomNotification('✅ Order placed successfully!');
      setTimeout(() => {
        window.location.href = `/payments/success?order_id=${orderId}`;
      }, 1500);
    } catch (err) {
      console.error('Error placing order:', err.response?.data || err.message);
      showCustomNotification(
        `Error placing order: ${err.response?.data?.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      {showNotification && (
        <div className={`custom-notification ${notificationType}`}>
          {notification}
        </div>
      )}

      <h2>Shipping Address</h2>
      <input
        placeholder="Street"
        value={address.street}
        onChange={(e) => setAddress({ ...address, street: e.target.value })}
      />
      <input
        placeholder="City"
        value={address.city}
        onChange={(e) => setAddress({ ...address, city: e.target.value })}
      />
      <input
        placeholder="State"
        value={address.state}
        onChange={(e) => setAddress({ ...address, state: e.target.value })}
      />
      <input
        placeholder="Postal Code"
        value={address.postalCode}
        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
      />

      <h3>Payment Information</h3>
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="Credit Card">Credit Card</option>
        <option value="Debit Card">Debit Card</option>
      </select>
      <input
        placeholder="Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} // numeric only
        inputMode="numeric"
        maxLength={16}
      />

      <button disabled={loading} onClick={handlePlaceOrder}>
        {loading ? 'Placing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default OrderForm;
