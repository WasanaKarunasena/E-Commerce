import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CartItems.css';
import remove_icon from '../Assets/remove_icon.png';
import { ShopContext } from '../../Context/ShopContext';

const CartItems = () => {
  const { all_product, cartItems, removeFromCart, updateCartItem } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  // local input values for editing quantities
  const [inputValues, setInputValues] = useState({});

  // Sync inputValues with cartItems on mount or update
  useEffect(() => {
    const initialValues = {};
    all_product.forEach((product) => {
      if (cartItems[product.id] > 0) {
        initialValues[product.id] = cartItems[product.id].toString();
      }
    });
    setInputValues(initialValues);
  }, [cartItems, all_product]);

  const getTotalCartAmount = () => {
    return all_product.reduce((total, product) => {
      return total + (cartItems[product.id] || 0) * product.new_price;
    }, 0);
  };

  const totalAmount = getTotalCartAmount();

  const selectedProducts = all_product
    .filter((p) => cartItems[p.id] > 0)
    .map((p) => ({
      ...p,
      quantity: cartItems[p.id],
    }));

  const handleInputChange = (id, value) => {
    // Allow only digits or empty string
    if (/^\d*$/.test(value)) {
      setInputValues((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const commitQuantityChange = (id) => {
    const value = inputValues[id];
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 0) {
      updateCartItem(id, parsed);
    } else {
      // Revert to current cart quantity if invalid
      setInputValues((prev) => ({
        ...prev,
        [id]: cartItems[id].toString(),
      }));
    }
  };

  const handleProceedCheckout = () => {
    const token = localStorage.getItem('auth-token');

    if (!token) {
      // not logged in → go to login/signup and remember current page
      navigate('/login', { state: { from: location } });
    } else {
      // logged in → go to checkout with selected products
      if (selectedProducts.length > 0) {
        navigate('/order-now', { state: { products: selectedProducts } });
      } else {
        alert('No product selected.');
      }
    }
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {selectedProducts.map((e) => (
        <div key={e.id}>
          <div className="cartitems-format">
            <img src={e.image[0]} alt="" className="carticon-product-icon" />
            <p>{e.name}</p>
            <p>LKR{e.new_price}</p>
            <input
              type="number"
              min="0"
              className="cartitems-quantity-input"
              value={inputValues[e.id] ?? e.quantity}
              onChange={(event) => handleInputChange(e.id, event.target.value)}
              onBlur={() => commitQuantityChange(e.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitQuantityChange(e.id);
                }
              }}
            />
            <p>LKR{(e.new_price * e.quantity).toFixed(2)}</p>
            <img
              src={remove_icon}
              onClick={() => removeFromCart(e.id)}
              alt="Remove"
              className="cartitems-remove-icon"
            />
          </div>
          <hr />
        </div>
      ))}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>LKR{totalAmount.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>LKR{totalAmount.toFixed(2)}</h3>
            </div>
          </div>
          <button className="proceed-button" onClick={handleProceedCheckout}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cartitems-promocode">
          <p>If you have a promocode, enter it below</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promocode" />
            <button className="submit-button">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
