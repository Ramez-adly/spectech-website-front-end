import React, { useEffect, useState } from 'react';
import './Products.css'; 

const Products = ({ navigate, isAuthenticated }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState(() => {
        const savedCart = document.cookie
            .split('; ')
            .find(row => row.startsWith('cart='));
        return savedCart ? JSON.parse(decodeURIComponent(savedCart.split('=')[1])) : [];
    });

    const findMatchingImage = (productName) => {
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
            'Crucial RAM 32GB.jpg',
            'xigmatek Case.jpeg',
            'Alseye.jpeg'
        ];

        const matchingImage = availableImages.find(imageName => 
            lowerName.includes(imageName.split('.')[0].toLowerCase()) ||
            imageName.split('.')[0].toLowerCase().includes(lowerName)
        );

        return matchingImage ? `/images/${matchingImage}` : '/images/placeholder.jpg';
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5555/products'); 
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
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

    const addToCart = async (product) => {
        if (!isAuthenticated) {
            alert('Please login to add items to cart');
            navigate('login');
            return;
        }

        try {
            // Verify authentication and user type
            const authResponse = await fetch('http://localhost:5555/check-auth', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            const authData = await authResponse.json();
            if (!authData.authenticated) {
                alert('Please login to add items to cart');
                navigate('login');
                return;
            }

            // Check if user is a customer
            if (authData.customertype !== 'customer') {
                alert('Only customers can add items to cart');
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

            // Save cart with a 5-hour expiration (matching backend token expiration)
            const expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (5 * 60 * 60 * 1000));
            document.cookie = `cart=${encodeURIComponent(JSON.stringify(updatedCart))}; expires=${expirationDate.toUTCString()}; path=/`;
            
            setCart(updatedCart);
            window.dispatchEvent(new Event('cart-update'));
            alert('Item added to cart successfully!');
            navigate('cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart. Please try again.');
        }
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
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="products-page">
            <h1>Our Products</h1>
            <div className="product-list">
                {products.map(product => {
                    const imageUrl = findMatchingImage(product.name);
                    return (
                        <div key={product.ID} className="product-card">
                            <div className="product-image" onClick={() => {
                                console.log('Navigating with product ID:', product.ID);
                                navigate('product-details', { productId: product.ID });
                            }}>
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
                                <h2 onClick={() => {
                                    console.log('Navigating with product ID:', product.ID);
                                    navigate('product-details', { productId: product.ID });
                                }}>{product.name}</h2>
                                <p>Price: ${product.price.toFixed(2)}</p>
                                <p>Category: {product.category}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Products;
