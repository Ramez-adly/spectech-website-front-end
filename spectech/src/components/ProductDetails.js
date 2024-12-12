import React, { useState, useEffect } from 'react';
import './ProductDetails.css';

const ProductDetails = ({ productId, navigate }) => {
    const [product, setProduct] = useState(null);
    const [storePrices, setStorePrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                // Fetch product details
                const productResponse = await fetch(`http://localhost:5555/products/search?id=${productId}`);
                if (!productResponse.ok) throw new Error('Failed to fetch product details');
                const productData = await productResponse.json();
                setProduct(productData[0]);

                // Fetch stores with prices for this product using the new endpoint
                const storeResponse = await fetch(`http://localhost:5555/products/${productId}/stores`);
                if (!storeResponse.ok) throw new Error('Failed to fetch store prices');
                const storesWithPrices = await storeResponse.json();
                setStorePrices(storesWithPrices);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductDetails();
        }
    }, [productId]);

    const addToCart = (storeId, price) => {
        const cartItem = {
            id: product.ID,
            name: product.name,
            price: price,
            storeId: storeId,
            quantity: 1,
            image_url: product.image_url
        };

        try {
            // Get existing cart
            const savedCart = document.cookie
                .split('; ')
                .find(row => row.startsWith('cart='));
            
            let cart = [];
            if (savedCart) {
                cart = JSON.parse(decodeURIComponent(savedCart.split('=')[1]));
            }

            // Check if item already exists in cart
            const existingItemIndex = cart.findIndex(item => 
                item.id === cartItem.id && item.storeId === cartItem.storeId
            );

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                cart[existingItemIndex].quantity += 1;
            } else {
                // Add new item if it doesn't exist
                cart.push(cartItem);
            }

            // Save updated cart with expiration of 7 days
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            document.cookie = `cart=${encodeURIComponent(JSON.stringify(cart))}; path=/; expires=${expirationDate.toUTCString()}`;
            
            // Dispatch cart update event
            window.dispatchEvent(new Event('cart-update'));

            // Show success message
            alert('Item added to cart successfully!');

            // Navigate to cart using the custom navigation
            navigate('cart');
        } catch (error) {
            console.error('Error adding item to cart:', error);
            alert('Failed to add item to cart. Please try again.');
        }
    };

    if (loading) return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
        </div>
    );
    
    if (error) return (
        <div className="error">
            <h3>Error Loading Product</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
                Retry
            </button>
            <button onClick={() => navigate('home')} className="back-btn">
                Back to Home
            </button>
        </div>
    );
    if (!product) return (
        <div className="error">
            <h3>Product Not Found</h3>
            <p>The requested product could not be found.</p>
            <button onClick={() => navigate('home')} className="back-btn">
                Back to Home
            </button>
        </div>
    );

    return (
        <div className="product-details-container">
            <div className="product-info">
                <img src={product.image_url} alt={product.name} className="product-image" />
                <div className="product-text">
                    <h2>{product.name}</h2>
                    <p className="category">Category: {product.category}</p>
                    <p className="stock">In Stock: {product.stock} units</p>
                    <p className="description">{product.description}</p>
                    {product.specifications && (
                        <div className="specifications">
                            <h3>Specifications:</h3>
                            <ul>
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <li key={key}><strong>{key}:</strong> {value}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="store-prices">
                <h3>Available at Stores:</h3>
                {storePrices.length === 0 ? (
                    <div className="no-stores">
                        <p>No stores currently have this product in stock</p>
                        <button onClick={() => navigate('home')} className="back-btn">
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="store-list">
                        {storePrices
                            .sort((a, b) => a.price - b.price) // Sort by price
                            .map((store) => (
                                <div key={store.storeId} className="store-card">
                                    <div className="store-info">
                                        <h4>{store.storeName}</h4>
                                        <p className="location">Location: {store.location}</p>
                                        <p className="price">Price: ${store.price.toFixed(2)}</p>
                                        {store.deliveryAvailable && (
                                            <p className="delivery">✓ Delivery Available</p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => addToCart(store.storeId, store.price)}
                                        className="add-to-cart-btn"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
