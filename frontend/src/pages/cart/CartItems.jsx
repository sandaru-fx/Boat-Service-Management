import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import remove_icon from "../../assets/cart_cross_icon.png";
import "./CartItems.css";

const CartItems = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // update cart throug localstorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  const updateCart = (updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    // Dispatch storage event so Navbar updates instantly
    window.dispatchEvent(new Event("storage"));
  };

  const handleRemove = (_id) => {
    const updated = cartItems.filter((item) => item._id !== _id);
    updateCart(updated);
  };

  const handleQtyChange = (_id, delta) => {
    const updated = cartItems.map((item) => {
      if (item._id === _id) {
        return { ...item, selectedQty: Math.max(item.selectedQty + delta, 1) };
      }
      return item;
    });
    updateCart(updated);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.selectedQty, 0);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add some items first.');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cartitems">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/spare-parts" 
          className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      <div className="cartitems-format-main">
        <p>Product</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {cartItems.map((item) => (
        <div key={item._id}>
          <div className="cartitems-format cartitems-format-main">
            <img src={item.image} alt={item.name} className="carticon-product-icon" />
            <p>{item.name}</p>
            <p>Rs. {item.price}</p>
            <div className="cartitems-quantity-buttons">
              <button onClick={() => handleQtyChange(item._id, -1)}>-</button>
              <span className="cartitems-quantity">{item.selectedQty}</span>
              <button onClick={() => handleQtyChange(item._id, 1)}>+</button>
            </div>
            <p>Rs. {item.price * item.selectedQty}</p>
            <img
              src={remove_icon}
              alt="Remove"
              className="cartitems-remove-icon"
              onClick={() => handleRemove(item._id)}
            />
          </div>
          <hr />
        </div>
      ))}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div className="cartitems-total-item">
            <p>Subtotal</p>
            <p>Rs. {subtotal}</p>
          </div>
          <div className="cartitems-total-item">
            <p>Shipping Fee</p>
            <p>Free</p>
          </div>
          <hr/>
          <div className="cartitems-total-item">
            <h3>Total</h3>
            <h3>Rs. {subtotal}</h3>
          </div>
          <hr/>
          <button onClick={handleProceedToCheckout}>PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
