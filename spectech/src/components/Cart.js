import React, { useState, useEffect } from 'react';
import './Cart.css';

const Cart = ({ navigate }) => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
        loadCart();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:5555/check-auth', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                navigate('login');
                return;
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            navigate('login');
        }
    };

    const loadCart = () => {
        const savedCart = document.cookie
            .split('; ')
            .find(row => row.startsWith('cart='));
        
        if (savedCart) {
            const cartItems = JSON.parse(decodeURIComponent(savedCart.split('=')[1]));
            setCart(cartItems);
            calculateTotal(cartItems);
        }
        setLoading(false);
    };

    const calculateTotal = (items) => {
        const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum);
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedCart = cart.map(item => 
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        );

        setCart(updatedCart);
        document.cookie = `cart=${encodeURIComponent(JSON.stringify(updatedCart))}; path=/`;
        calculateTotal(updatedCart);
        window.dispatchEvent(new Event('cart-update'));
    };

    const removeItem = (itemId) => {
        const updatedCart = cart.filter(item => item.id !== itemId);
        setCart(updatedCart);
        document.cookie = `cart=${encodeURIComponent(JSON.stringify(updatedCart))}; path=/`;
        calculateTotal(updatedCart);
        window.dispatchEvent(new Event('cart-update'));
    };

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            // Process each item in the cart
            for (const item of cart) {
                const response = await fetch('http://localhost:5555/purchase', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        productID: item.id,
                        quantity: item.quantity
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to purchase ${item.name}`);
                }
            }

            // Clear cart after successful purchase
            setCart([]);
            document.cookie = 'cart=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.dispatchEvent(new Event('cart-update'));
            alert('Purchase successful! Thank you for shopping with us.');

        } catch (err) {
            setError(err.message);
            alert('Failed to complete purchase. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="cart-container">
                <h2>Loading...</h2>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="cart-container">
                <h2>Your Cart</h2>
                <p>Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h2>Your Cart</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="cart-items">
                {cart.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="item-details">
                            <h3>{item.name}</h3>
                            <p>Price: ${item.price}</p>
                        </div>
                        <div className="item-controls">
                            <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>
                            <span>{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                                +
                            </button>
                            <button 
                                className="remove-button"
                                onClick={() => removeItem(item.id)}
                            >
                                Remove
                            </button>
                        </div>
                        <div className="item-total">
                            Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-summary">
                <h3>Total: ${total.toFixed(2)}</h3>
                <button 
                    className="checkout-button" 
                    onClick={handleCheckout}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Checkout'}
                </button>
            </div>
        </div>
    );
};

export default Cart;
