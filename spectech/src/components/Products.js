import React, { useEffect, useState } from 'react';
import './Products.css'; 

const Products = ({ navigate,  }) => {
    const [products, setProducts]=useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5555/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again later.');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

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
