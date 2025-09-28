import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data);
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2>All Orders (Admin)</h2>
      {orders.map(order => (
        <div key={order._id}>
          <h4>Order: {order._id}</h4>
          <p>Customer: {order.customerId?.name}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;