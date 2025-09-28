import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    };

    fetchOrder();
  }, [id]);

  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <h2>Order #{order._id}</h2>
      <p>Status: {order.status}</p>
      <p>Payment Status: {order.paymentStatus}</p>
      <ul>
        {order.order_items.map(item => (
          <li key={item.itemId}>
            {item.name} - {item.quantity} x Rs. {item.unitPrice}
          </li>
        ))}
      </ul>
      <p>Total: Rs. {order.totalAmount}</p>
    </div>
  );
};

export default OrderDetails;