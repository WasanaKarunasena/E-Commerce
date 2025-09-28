import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Notification from './Notification/Notification';
import './AdminDiscountList.css';

// Use Vite environment variable
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const DISCOUNT_URL = `${API_BASE_URL}/discounts`;
const CATEGORY_URL = `${API_BASE_URL}/categories`;
const SUBCATEGORY_URL = `${API_BASE_URL}/sub-categories`;
const ITEM_URL = `${API_BASE_URL}/items`;

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const AdminDiscountList = ({ token }) => {
  const [discounts, setDiscounts] = useState([]);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    applicableItems: [],
    applicable_SubCategories: [],
    applicableCategories: [],
    startDate: '',
    endDate: '',
    isActive: true,
    usageLimit: ''
  });

  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, discountId: null });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (user && user.role === 'Admin') {
      axios.get(DISCOUNT_URL, authHeader(token))
        .then(res => setDiscounts(res.data))
        .catch(() => {
          setNotification({ message: 'Failed to fetch discounts', type: 'error' });
          setShowNotification(true);
        });

      axios.get(CATEGORY_URL, authHeader(token)).then(res => setCategories(res.data)).catch(() => {});
      axios.get(SUBCATEGORY_URL, authHeader(token)).then(res => setSubCategories(res.data)).catch(() => {});
      axios.get(ITEM_URL, authHeader(token)).then(res => setItems(res.data)).catch(() => {});
    }
  }, [token, user]);

  const handleChange = (e) => {
    const { name, value, type, checked, options, multiple } = e.target;

    if (multiple) {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);

      setFormData(prev => ({
        ...prev,
        [name]: selectedValues
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' });
    setShowNotification(false);

    if (!formData.code || !formData.value || !formData.startDate || !formData.endDate) {
      setNotification({ message: 'Please fill in all required fields.', type: 'error' });
      setShowNotification(true);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        value: Number(formData.value),
        minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : 0,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      const newDiscount = await axios.post(DISCOUNT_URL, dataToSend, authHeader(token));
      setDiscounts(prev => [...prev, newDiscount.data]);

      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        minPurchase: '',
        maxDiscount: '',
        applicableItems: [],
        applicable_SubCategories: [],
        applicableCategories: [],
        startDate: '',
        endDate: '',
        isActive: true,
        usageLimit: ''
      });

      setNotification({ message: 'Discount created successfully.', type: 'success' });
      setShowNotification(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error creating discount';
      setNotification({ message: msg, type: 'error' });
      setShowNotification(true);
    }
  };

  if (!user) return <div className="admin-text-red">Loading...</div>;
  if (user.role !== 'Admin') return <div className="admin-text-red">Access Denied</div>;

  return (
    <div className="admin-container">
      <h2 className="admin-header">All Discounts</h2>

      {showNotification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setShowNotification(false)}
        />
      )}

      {deleteConfirm.show && (
        <div className="admin-confirm-overlay">
          <div className="admin-confirm-box">
            <p>Are you sure you want to delete this discount?</p>
            <div className="admin-confirm-buttons">
              <button
                className="admin-button admin-button-cancel"
                onClick={() => setDeleteConfirm({ show: false, discountId: null })}
              >
                Cancel
              </button>
              <button
                className="admin-button admin-button-delete"
                onClick={() => {
                  axios.delete(`${DISCOUNT_URL}/${deleteConfirm.discountId}`, authHeader(token))
                    .then(() => {
                      setDiscounts(prev => prev.filter(d => d._id !== deleteConfirm.discountId));
                      setNotification({ message: 'Discount deleted successfully.', type: 'success' });
                      setShowNotification(true);
                    })
                    .catch(err => {
                      const msg = err.response?.data?.error || 'Error deleting discount';
                      setNotification({ message: msg, type: 'error' });
                      setShowNotification(true);
                    })
                    .finally(() => setDeleteConfirm({ show: false, discountId: null }));
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="admin-subheader">Create a new Discount</h3>
      <form className="admin-form" onSubmit={handleCreate}>
        <label>
          Code:
          <input type="text" name="code" value={formData.code} onChange={handleChange} required />
        </label>

        <label>
          Type:
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
            <option value="bogo">BOGO</option>
          </select>
        </label>

        <label>
          Value:
          <input type="number" name="value" value={formData.value} onChange={handleChange} required />
        </label>

        <label>
          Min Purchase:
          <input type="number" name="minPurchase" value={formData.minPurchase} onChange={handleChange} />
        </label>

        <label>
          Max Discount:
          <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} />
        </label>

        <label>
          Usage Limit:
          <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} />
        </label>

        <label>
          Start Date:
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        </label>

        <label>
          End Date:
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        </label>

        <label>
          Is Active:
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
        </label>

        <label>
          Applicable Items:
          <select name="applicableItems" value={formData.applicableItems} onChange={handleChange} multiple>
            {items.map(item => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>
          <small>Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
        </label>

        <label>
          Applicable SubCategories:
          <select name="applicable_SubCategories" value={formData.applicable_SubCategories} onChange={handleChange} multiple>
            {subCategories.map(sub => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
          <small>Hold Ctrl or Cmd to select multiple</small>
        </label>

        <label>
          Applicable Categories:
          <select name="applicableCategories" value={formData.applicableCategories} onChange={handleChange} multiple>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <small>Hold Ctrl or Cmd to select multiple</small>
        </label>

        <button type="submit" className="admin-button">Create Discount</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Start</th>
            <th>End</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map(discount => (
            <tr key={discount._id}>
              <td>{discount.code}</td>
              <td>{discount.type}</td>
              <td>{discount.value}</td>
              <td>{new Date(discount.startDate).toLocaleDateString()}</td>
              <td>{new Date(discount.endDate).toLocaleDateString()}</td>
              <td>{discount.isActive ? 'Yes' : 'No'}</td>
              <td>
                <button
                  onClick={() => setDeleteConfirm({ show: true, discountId: discount._id })}
                  className="admin-button admin-button-delete"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDiscountList;