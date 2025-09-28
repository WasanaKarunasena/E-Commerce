import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import logo from '../Components/Assets/logo.png';
import './Success.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Success = () => {
  const query = new URLSearchParams(useLocation().search);
  const orderId = query.get('order_id');
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('auth-token');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!token) {
          setError("No auth token found");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const foundOrder = res.data.find(o => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading order");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
    else {
      setError("Missing order ID in URL");
      setLoading(false);
    }
  }, [orderId, token]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true,
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const handleDownloadReceipt = () => {
    if (!order) return;

    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);

      doc.addImage(img, 'PNG', 14, 14, 30, 15);

      doc.setTextColor('#EB1E21');
      doc.setFontSize(18);
      doc.text('EliteCell', 50, 24);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);

      doc.text(`Order ID: ${order._id}`, 14, 40);
      doc.text(`Order Date: ${formatDateTime(order.createdAt)}`, 14, 48);
      doc.text(`Customer Name: ${order.customerId?.userId?.name || 'N/A'}`, 14, 56);
      doc.text(`Payment Status: ${order.paymentStatus}`, 14, 64);
      doc.text(`Order Status: ${order.status}`, 14, 72);
      doc.text(
        `Shipping: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`,
        14,
        80
      );

      const tableData = order.order_items.map((item, index) => [
        index + 1,
        item.name || item.itemId?.name || 'Unnamed',
        item.quantity,
        `Rs ${item.unitPrice}`,
        `Rs ${item.unitPrice * item.quantity}`
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['#', 'Item Name', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
      });

      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(12);
      doc.text(`Total Amount: Rs ${order.totalAmount.toFixed(2)}`, 14, finalY + 10);

      if (order.discount && order.discount > 0) {
        doc.text(`Discount: -Rs ${order.discount.toFixed(2)}`, 14, finalY + 18);
        doc.text(`Final Amount to Pay: Rs ${order.lastAmount.toFixed(2)}`, 14, finalY + 26);
      } else {
        doc.text(`Final Amount to Pay: Rs ${order.lastAmount.toFixed(2)}`, 14, finalY + 18);
      }

      doc.save(`Receipt_${order._id}.pdf`);
    };
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <h1 className="success-title">✅ Order Successful</h1>
        <p className="success-message">Thank you for your order!</p>

        {orderId && (
          <p className="order-id">
            Order ID: <strong>{orderId}</strong>
          </p>
        )}

        {loading && <p>Loading order details...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Show order summary on UI */}
        {order && (
          <div className="summary-display">
            <p>Total Amount: Rs {order.totalAmount.toFixed(2)}</p>
            {order.discount > 0 && <p>Discount Applied: -Rs {order.discount.toFixed(2)}</p>}
            <p><strong>Final Amount: Rs {order.lastAmount.toFixed(2)}</strong></p>
          </div>
        )}

        <div className="button-group">
          <button className="btn back-btn" onClick={() => navigate('/')}>
            Return to Shop
          </button>
          <button className="btn orders-btn" onClick={() => navigate('/orders')}>
            View My Orders
          </button>
          {order && (
            <button className="btn receipt-btn" onClick={handleDownloadReceipt}>
              Download Receipt PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;