import React, { createContext, useState, useEffect } from 'react';

export const ShopContext = createContext(null);

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getDefaultCart = (products) => {
  const cart = {};
  products.forEach((product) => {
    cart[product.id] = 0;
  });
  return cart;
};

const ShopContextProvider = ({ children }) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductsAndCart = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/items`);
        const data = await res.json();

        const formattedData = data.map((product) => ({
          ...product,
          id: product._id,
        }));

        setAll_Product(formattedData);

        const token = localStorage.getItem('auth-token');
        if (token) {
          const cartRes = await fetch(`${API_BASE_URL}/carts`, {
            method: 'GET',
            headers: {
              'auth-token': token,
              'Content-Type': 'application/json',
            },
          });

          const cart = await cartRes.json();
          const cartObj = getDefaultCart(formattedData);
          cart.items.forEach(({ itemId, quantity }) => {
            cartObj[itemId._id] = quantity;
          });

          setCartItems(cartObj);
        } else {
          const storedCart = JSON.parse(localStorage.getItem('cart')) || {};
          setCartItems(storedCart);
        }
      } catch (err) {
        console.error('Error fetching products or cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCart();
  }, []);

  const addToCart = (itemId) => {
    // Guest and logged-in users both can add
    const updatedCart = {
      ...cartItems,
      [itemId]: (cartItems[itemId] || 0) + 1,
    };
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    const token = localStorage.getItem('auth-token');
    if (token) {
      fetch(`${API_BASE_URL}/carts`, {
        method: 'POST',
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, quantity: 1 }),
      }).catch((err) => console.error('Add to cart error:', err));
    }
  };

  const removeFromCart = (itemId) => {
    const updatedCart = { ...cartItems };
    const newCount = (updatedCart[itemId] || 1) - 1;
    if (newCount > 0) {
      updatedCart[itemId] = newCount;
    } else {
      delete updatedCart[itemId];
    }
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    const token = localStorage.getItem('auth-token');
    if (token) {
      fetch(`${API_BASE_URL}/carts/${itemId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      }).catch((err) => console.error('Remove from cart error:', err));
    }
  };

  const updateCartItem = (itemId, quantity) => {
    const updatedCart = {
      ...cartItems,
      [itemId]: quantity,
    };
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    const token = localStorage.getItem('auth-token');
    if (token) {
      fetch(`${API_BASE_URL}/carts/${itemId}`, {
        method: 'PUT',
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      }).catch((err) => console.error('Update quantity error:', err));
    }
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    getTotalCartItems,
    loading,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
