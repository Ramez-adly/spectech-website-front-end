import React, { useEffect, useState } from 'react';
import './Home.css'; 

const Home = ({ navigate }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cart, setCart] = useState(() => {
        const savedCart = document.cookie
            .split('; ')
            .find(row => row.startsWith('cart='));
        return savedCart ? JSON.parse(decodeURIComponent(savedCart.split('=')[1])) : [];
    });

    const findMatchingImage = (productName) => {
        // Convert product name to lowercase for case-insensitive matching
        const lowerName = productName.toLowerCase();
        
        const availableImages = [
            'Noctua.jpeg',
            'corsair k95.jpeg',
            'Ryzen 5 5600x.jpeg',
            'asus ROG Swift.jpeg',
            'Asus b450-f.jpeg',
            'rtx 3060.jpeg',
            'Samsung 980.jpeg',
            'asus tuf gaming 1200W.jpeg',
            'Logitech G502 Hero.jpeg',
            'Crucial RAM 32GB.jpeg',
        ];

        // Find the image that contains part of the product name
        const matchingImage = availableImages.find(imageName => 
            lowerName.includes(imageName.split('.')[0].toLowerCase()) ||
            imageName.split('.')[0].toLowerCase().includes(lowerName)
        );

        return matchingImage ? `/images/${matchingImage}` : '/images/placeholder.jpg';
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5555/check-auth', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Auth check failed');
                }
                
                const data = await response.json();
                setIsLoggedIn(data.authenticated);
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsLoggedIn(false);
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5555/products'); 
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                console.log('Products data:', data); 
                setProducts(data);
            } catch (err) {
                console.error('Fetch error:', err); 
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const addToCart = (product) => {
        // Use the isLoggedIn state instead of checking cookie
        if (!isLoggedIn) {
            alert('Please login to add items to cart');
            navigate('login');
            return;
        }

        const updatedCart = [...cart];
        const existingItem = updatedCart.find(item => item.id === product.ID);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            updatedCart.push({
                id: product.ID,
                name: product.name,
                price: product.price,
                quantity: 1,
                image_url: product.image_url
            });
        }
        
        // Update state and cookie
        setCart(updatedCart);
        document.cookie = `cart=${encodeURIComponent(JSON.stringify(updatedCart))}; path=/`;
        window.dispatchEvent(new Event('cart-update'));
        alert('Added to cart!');
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <h3>Error Loading Products</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="home">
            <h1>Available Products</h1>
            <div className="product-list">
                {products.map(product => {
                    const imageUrl = findMatchingImage(product.name);
                    return (
                        <div key={product.ID} className="product-card">
                            <div className="product-image" onClick={() => navigate('product-details', { productId: product.ID })}>
                                <img 
                                    src={imageUrl}
                                    alt={product.name}
                                    onError={(e) => {
                                        console.error('Image failed to load:', imageUrl);
                                        if (!e.target.src.includes('placeholder.jpg')) {
                                            e.target.src = '/images/placeholder.jpg';
                                        }
                                    }}
                                />
                            </div>
                            <div className="product-info">
                                <h2 onClick={() => navigate('product-details', { productId: product.ID })}>{product.name}</h2>
                                <p>Price: ${product.price.toFixed(2)}</p>
                                <p>Category: {product.category}</p>
                                <button 
                                    className="buy-button"
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                >
                                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;