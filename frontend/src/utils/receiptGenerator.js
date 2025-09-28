// src/utils/receiptGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../Components/Assets/logo.png'; // adjust path as needed

export const handleDownloadPDF = (order) => {
  const doc = new jsPDF();

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    doc.addImage(img, 'PNG', 14, 10, 30, 30);
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Your Company Name', 50, 20);
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text('Order Receipt', 50, 28);
    doc.line(14, 35, 195, 35);

    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0);
    doc.text('✅ Order Successful!', 14, 42);

    const shipping = order.shippingAddress || {};
    const customerName = order.customerId?.userId?.name || 'N/A';
    const address = `${shipping.street}, ${shipping.city}, ${shipping.state} - ${shipping.postalCode}`;

    let y = 52;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Order ID: ${order._id}`, 14, y);
    y += 7;
    doc.text(`Customer: ${customerName}`, 14, y);
    y += 7;
    doc.text(`Address: ${address}`, 14, y);
    y += 7;
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, y);

    const tableRows = order.order_items.map((item) => [
      item.name,
      item.quantity,
      `$${item.unitPrice.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: y + 10,
      head: [['Item', 'Quantity', 'Price']],
      body: tableRows,
    });

    const endY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: $${order.totalAmount.toFixed(2)}`, 14, endY);
    doc.text(`Discount: $${order.discount.toFixed(2)}`, 14, endY + 7);
    doc.text(`Final Amount Paid: $${order.lastAmount.toFixed(2)}`, 14, endY + 14);

    doc.save(`Receipt_${order._id}.pdf`);
  };
};
