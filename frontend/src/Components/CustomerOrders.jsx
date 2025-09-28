import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './CustomerOrders.css';
import logo from '../Components/Assets/logo.png'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          setError('You must be logged in to view your orders.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('You must be logged in to view your orders.');
        } else {
          setError('Failed to load orders.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDownloadReceipt = (order) => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277); // Outline

      doc.addImage(img, 'PNG', 14, 14, 30, 15);

      doc.setTextColor('#EB1E21');
      doc.setFontSize(18);
      doc.text('EliteCell', 50, 24);

      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(`Order ID: ${order._id}`, 14, 40);
      doc.text(`Customer Name: ${order.customerId?.userId?.name || 'N/A'}`, 14, 48);
      doc.text(`Payment Status: ${order.paymentStatus}`, 14, 56);
      doc.text(`Order Status: ${order.status}`, 14, 64);
      doc.text(`Ordered On: ${new Date(order.createdAt).toLocaleString()}`, 14, 72);

      if (order.shippingAddress) {
        doc.text(
          `Shipping: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`,
          14,
          80
        );
      }

      const tableData = order.order_items.map((item, i) => [
        i + 1,
        item.name || item.itemId?.name || 'Unnamed',
        item.quantity,
        `Rs ${item.unitPrice}`,
        `Rs ${item.unitPrice * item.quantity}`
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['#', 'Item Name', 'Qty', 'Unit Price', 'Total']],
        body: tableData
      });

      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(12);

      // Show totalAmount (before discount)
      doc.text(`Total Amount: Rs ${order.totalAmount.toFixed(2)}`, 14, finalY + 10);

      // Show discount if available
      if (order.discount && order.discount > 0) {
        doc.text(`Discount: -Rs ${order.discount.toFixed(2)}`, 14, finalY + 18);
        doc.text(`Final Amount to Pay: Rs ${order.lastAmount.toFixed(2)}`, 14, finalY + 26);
      } else {
        doc.text(`Final Amount to Pay: Rs ${order.lastAmount.toFixed(2)}`, 14, finalY + 18);
      }

      doc.save(`Receipt_${order._id}.pdf`);
    };
  };

  if (loading) return <p className="loading">Loading orders...</p>;
  if (error) return <p className="error">{error}</p>;
  if (orders.length === 0) return <p className="no-orders">You have no orders.</p>;

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Status</th>
            <th>Total (Rs.)</th>
            <th>Payment</th>
            <th>Ordered On</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.status}</td>
              <td>{order.lastAmount.toFixed(2)}</td>
              <td>{order.paymentStatus}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>
                <button className="download-btn" onClick={() => handleDownloadReceipt(order)}>
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerOrders;