import React from 'react';
import { useLocation } from 'react-router-dom';

const Cancel = () => {
  const query = new URLSearchParams(useLocation().search);
  const orderId = query.get("order_id");

  return (
    <div>
      <h1>Payment Cancelled ❌</h1>
      <p>Order ID: {orderId}</p>
      <a href="/">Try Again</a>
    </div>
  );
};

export default Cancel;
