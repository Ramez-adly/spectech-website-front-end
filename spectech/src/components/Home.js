import React, { useEffect, useState } from 'react';
import './Home.css'; 

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Convert file path to public URL
    const getImageUrl = (filepath) => {
        if (!filepath) return '';
        const filename = filepath.split('/').pop(); // Get the filename
        return `/images/${filename}`; // Return path relative to public folder
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5555/products'); 
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                console.log('Products data:', data); // Log the products data
                setProducts(data);
            } catch (err) {
                console.error('Fetch error:', err); // Log any errors
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="home">
            <h1>Available Products</h1>
            <div className="product-list">
                {products.map(product => {
                    console.log('Product image URL:', product.image_url); // Log each image URL
                    return (
                        <div key={product.ID} className="product-card">
                            <img 
                                src={getImageUrl(product.image_url)} 
                                alt={product.name}
                                onError={(e) => {
                                    console.log('Image load error for:', product.name); // Log image load errors
                                    e.target.src = '/images/placeholder.jpg'; // Fallback image
                                }}
                            />
                            <h2>{product.name}</h2>
                            <p>Price: ${product.price.toFixed(2)}</p>
                            <p>Category: {product.category}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;