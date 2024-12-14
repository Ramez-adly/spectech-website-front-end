import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = ({ productId, navigate, isAuthenticated }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [stores, setStores] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: ''
    });
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [storePrices, setStorePrices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductDetails();
        fetchReviews();
        checkAuth();
    }, [id]);

    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:5555/check-auth', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to check auth');
            const data = await response.json();

            if (data.authenticated) {
                setUser({
                    id: data.ID,
                    customertype: data.customertype,
                    name: data.name
                });
                console.log('Set user to:', {
                    id: data.ID,
                    customertype: data.customertype,
                    name: data.name
                });
            } else {
                console.log('Not authenticated');
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setUser(null);
        }
    };

    useEffect(() => {
        console.log('Current user state:', user);
    }, [user]);

    const fetchProductDetails = async () => {
        try {
            // Make sure productId exists
            if (!productId) {
                setError('No product ID provided');
                return;
            }

            console.log('Fetching product details for ID:', productId);

            // Use direct product endpoint instead of search
            const productResponse = await fetch(`http://localhost:5555/products/${productId}`);
            if (!productResponse.ok) throw new Error('Failed to fetch product details');
            const productData = await productResponse.json();
            
            if (!productData) {
                throw new Error('Product not found');
            }
            
            console.log('Product data:', productData);
            setProduct(productData);

            const storeResponse = await fetch(`http://localhost:5555/products/${productId}/stores`);
            if (!storeResponse.ok) throw new Error('Failed to fetch store prices');
            const storesWithPrices = await storeResponse.json();
            console.log('Store prices:', storesWithPrices);
            setStorePrices(storesWithPrices);
        } catch (err) {
            console.error('Error fetching product:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:5555/products/${productId}/reviews`);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setError('');

        if (!user) {
            setError('Please login to submit a review');
            return;
        }

        console.log('Current user state before review:', user);

        try {
            console.log('Product ID:', productId);
            
            // Make sure we're sending the correct ID format
            const reviewData = {
                userId: user.id,  // This should match ID=1 from your database
                rating: parseInt(newReview.rating),
                comment: newReview.comment
            };
            console.log('Sending review data:', reviewData);

            const response = await fetch(`http://localhost:5555/reviews/product/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(reviewData)
            });

            const responseData = await response.json();
            console.log('Review submission response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to submit review');
            }

            // Reset form and refresh reviews
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            setError(error.message);
            console.error('Error submitting review:', error);
        }
    };

    const addToCart = async (storeId, price) => {
        if (!isAuthenticated) {
            alert('Please log in to add items to cart');
            navigate('login');
            return;
        }

        try {
            // First verify authentication
            const authResponse = await fetch('http://localhost:5555/check-auth', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            const authData = await authResponse.json();
            if (!authData.authenticated) {
                alert('Please log in to add items to cart');
                navigate('login');
                return;
            }

            // Check if user is a customer
            if (authData.customertype !== 'customer') {
                alert('Only customers can add items to cart');
                return;
            }

            const cartItem = {
                id: product.ID,
                name: product.name,
                price: price,
                storeId: storeId,
                quantity: 1,
                image_url: product.image_url
            };

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

            // Save cart with a 5-hour expiration (matching backend token expiration)
            const expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (5 * 60 * 60 * 1000));
            document.cookie = `cart=${encodeURIComponent(JSON.stringify(cart))}; expires=${expirationDate.toUTCString()}; path=/`;
    
            // Dispatch cart update event
            window.dispatchEvent(new Event('cart-update'));
    
            alert('Item added to cart successfully!');
            navigate('cart');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add item to cart. Please try again.');
        }
    };

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
                <img 
                    src={findMatchingImage(product.name)} 
                    alt={product.name} 
                    className="product-image" 
                />
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
                            .sort((a, b) => a.price - b.price)
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
                                        className={`add-to-cart-btn ${!isAuthenticated ? 'disabled' : ''}`}
                                        disabled={!isAuthenticated}
                                    >
                                        {isAuthenticated ? 'Add to Cart' : 'Login to Add to Cart'}
                                    </button>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            <div className="reviews-section">
                <h2>Customer Reviews</h2>
                
                {user && user.customertype === 'customer' && (
                    <div className="review-form">
                        <h3>Write a Review</h3>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmitReview}>
                            <div className="rating-select">
                                <label>Rating:</label>
                                <select 
                                    value={newReview.rating}
                                    onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                                >
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>
                            <div className="comment-input">
                                <label>Comment:</label>
                                <textarea
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                    required
                                    placeholder="Share your thoughts about this product..."
                                />
                            </div>
                            <button type="submit">Submit Review</button>
                        </form>
                    </div>
                )}

                <div className="reviews-list">
                    {reviews.map(review => (
                        <div key={review.ID} className="review-card">
                            <div className="review-header">
                                <span className="reviewer-name">{review.userName}</span>
                                <span className="rating">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                                </span>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
