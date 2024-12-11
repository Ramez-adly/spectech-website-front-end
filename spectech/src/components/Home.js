import React, { useEffect, useState } from 'react';
import './Home.css'; 

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                {products.map(product => (
                    <div key={product.ID} className="product-card">
                        <img src={product.image_url} alt={product.name} />
                        <h2>{product.name}</h2>
                        <p>Price: ${product.price.toFixed(2)}</p>
                        <p>Category: {product.category}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;