import React, { useEffect, useState } from 'react';
import Notification from '../Notification/Notification';
import './TransferAdminPanel.css';

const TransferAdminPanel = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [updatingIds, setUpdatingIds] = useState([]); // list of userIds being updated

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        // decode token to get current user id (guard in case token shape differs)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserId(payload.id || payload._id || '');
        } catch (err) {
          console.warn('Failed to parse token payload:', err);
        }

        const res = await fetch(`${BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();
        const data = contentType.includes('application/json') ? JSON.parse(text) : text;

        if (!res.ok) {
          throw new Error(data?.error || data?.message || `Status ${res.status}`);
        }

        // if the API returns { data: [...] } adjust accordingly:
        setUsers(Array.isArray(data) ? data : data?.data ?? []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, BASE_URL]);

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const setUpdating = (userId, val) => {
    setUpdatingIds(prev => {
      if (val) return [...prev, userId];
      return prev.filter(id => id !== userId);
    });
  };

  // Promote -> PUT /api/transfer-admin/:id   (keeps old endpoint name)
  const promoteToAdmin = async (userId) => {
    if (!token) return showNotif('Missing auth token', 'error');

    setUpdating(userId, true);
    try {
      const res = await fetch(`${BASE_URL}/api/transfer-admin/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // send empty body to satisfy servers expecting JSON
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Status ${res.status}`);
      }

      // update local state without reload
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, userType: 'Admin' } : u));
      showNotif(data?.message || 'User promoted to Admin', 'success');
    } catch (err) {
      console.error('Promote error:', err);
      showNotif(err.message || 'Error promoting user', 'error');
    } finally {
      setUpdating(userId, false);
    }
  };

  // Demote -> PUT /api/demote-admin/:id   (you must have this endpoint backend-side)
  const demoteToCustomer = async (userId) => {
    if (!token) return showNotif('Missing auth token', 'error');

    // prevent self-demotion
    if (userId === currentUserId) {
      return showNotif('You cannot demote your own account', 'error');
    }

    setUpdating(userId, true);
    try {
      const res = await fetch(`${BASE_URL}/api/demote-admin/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Status ${res.status}`);
      }

      setUsers(prev => prev.map(u => u._id === userId ? { ...u, userType: 'Customer' } : u));
      showNotif(data?.message || 'Admin demoted to Customer', 'success');
    } catch (err) {
      console.error('Demote error:', err);
      showNotif(err.message || 'Error demoting user', 'error');
    } finally {
      setUpdating(userId, false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const adminUsers = users.filter((u) => u.userType === 'Admin');
  const customerUsers = users.filter((u) => u.userType !== 'Admin');

  return (
    <div className="transfer-admin-panel" style={{ padding: '20px' }}>
      <h2>Manage User Roles</h2>

      {showNotification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setShowNotification(false)}
        />
      )}

      <h3>Admin Users</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: '30px' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Demote</th>
          </tr>
        </thead>
        <tbody>
          {adminUsers.map((user) => {
            const isUpdating = updatingIds.includes(user._id);
            return (
              <tr
                key={user._id}
                style={{
                  backgroundColor: user._id === currentUserId ? '#e7f3ff' : 'transparent',
                  fontWeight: user._id === currentUserId ? 'bold' : 'normal',
                }}
              >
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.userType}</td>
                <td>
                  {user._id !== currentUserId ? (
                    <button
                      onClick={() => demoteToCustomer(user._id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Working...' : 'Demote to Customer'}
                    </button>
                  ) : (
                    <em>(You)</em>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>Customer Users</h3>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Promote</th>
          </tr>
        </thead>
        <tbody>
          {customerUsers.map((user) => {
            const isUpdating = updatingIds.includes(user._id);
            return (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.userType}</td>
                <td>
                  <button
                    onClick={() => promoteToAdmin(user._id)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Working...' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransferAdminPanel;
