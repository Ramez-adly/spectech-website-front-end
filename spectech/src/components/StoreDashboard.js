import React, { useState, useEffect } from 'react';
import './StoreDashboard.css';

const StoreDashboard = () => {
    const [products, setProducts] = useState([]);
    const [storeProducts, setStoreProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [storeID, setStoreID] = useState(null);
    const [editingStock, setEditingStock] = useState(null);
    const [newStock, setNewStock] = useState('');

    // Get store ID from authenticated user
    useEffect(() => {
        if (storeID) {
            fetchStoreProducts(storeID);
        }
    }, [storeID]);

    // Fetch store information for authenticated user
    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const response = await fetch('http://localhost:5555/check-auth', {
                    credentials: 'include'
                });
                const data = await response.json();

                if (!data.authenticated || data.customertype !== 'store') {
                    setMessage('Unauthorized: Please login as a store owner');
                    return;
                }

                // Fetch store ID for the authenticated user
                const storeResponse = await fetch(`http://localhost:5555/stores/user`, {
                    credentials: 'include'
                });
                const storeData = await storeResponse.json();

                if (!storeResponse.ok) {
                    throw new Error('Failed to fetch store information');
                }

                setStoreID(storeData.storeId);
                fetchStoreProducts(storeData.storeId);
            } catch (error) {
                console.error('Error fetching store info:', error);
                setMessage('Failed to load store information');
            }
        };

        fetchStoreInfo();
    }, []);
    const fetchStoreProducts = async (storeId) => {
        if (!storeId) {
            console.error('No store ID available');
            setMessage('Store ID not found');
            return;
        }
    
        try {
            console.log('Fetching products for storeId:', storeId);
            const response = await fetch(`http://localhost:5555/stores/${storeId}/products`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Raw response:', responseText);
    
            let data;
            try {
                data = JSON.parse(responseText);
                // Ensure data is always an array
                if (!Array.isArray(data)) {
                    data = [];
                    console.warn('Server response was not an array, defaulting to empty array');
                }
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                data = []; // Default to empty array on parse error
            }
    
            setStoreProducts(data);
            console.log('Processed products:', data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setMessage('Failed to load store products');
            setStoreProducts([]); // Set empty array on error
        }
    };
    // Fetch available products that can be added to the store
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5555/products');
                if (!response.ok) {
                    throw new Error('Failed to load products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setMessage('Failed to load products');
            }
        };
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
    
        if (!selectedProduct || !price || !stock) {
            setMessage('Please fill in all fields');
            setLoading(false);
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5555/stores/${storeID}/products/add`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productID: selectedProduct,
                    price: parseFloat(price),
                    stock: parseInt(stock)
                })
            });
    
            // First check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error('Failed to add product');
            }
    
            // Try to parse JSON only if response is ok
            try {
                const data = await response.json();
                setMessage('Product added successfully!');
                setSelectedProduct('');
                setPrice('');
                setStock('');
                // Add a small delay before fetching products
                setTimeout(() => {
                    fetchStoreProducts(storeID);
                }, 500);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new Error('Invalid server response');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (productId) => {
        if (!newStock || isNaN(newStock) || parseInt(newStock) < 0) {
            setMessage('Please enter a valid stock number');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5555/stores/${storeID}/products/${productId}/stock`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stock: parseInt(newStock) })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update stock');
            }

            setMessage('Stock updated successfully!');
            setEditingStock(null);
            setNewStock('');
            fetchStoreProducts(storeID);
        } catch (error) {
            console.error('Error:', error);
            setMessage(error.message);
        }
    };

    const handleRemoveProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to remove this product?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5555/stores/${storeID}/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove product');
            }

            setMessage('Product removed successfully!');
            fetchStoreProducts(storeID);
        } catch (error) {
            console.error('Error:', error);
            setMessage(error.message);
        }
    };

    if (!storeID) {
        return <div className="store-dashboard">
            <h2>Store Dashboard</h2>
            <p>{message || 'Loading store information...'}</p>
        </div>;
    }

    return (
        <div className="store-dashboard">
            <h2>Store Dashboard</h2>

            {/* Add Product Form */}
            <div className="dashboard-section">
                <h3>Add New Product</h3>
                <form onSubmit={handleSubmit}>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        required
                    >
                        <option value="">Select a product</option>
                        {products.map(product => (
                            <option key={product.ID} value={product.ID}>
                                {product.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter price"
                        required
                    />

                    <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="Enter initial stock"
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </form>
            </div>

            {/* Store Products List */}
            <div className="dashboard-section">
                <h3>Your Products</h3>
                <div className="products-list">
                    {storeProducts.map(product => (
                        <div key={product.product_ID} className="product-item">
                            <div className="product-info">
                                <h4>{product.productName}</h4>
                                <p>Price: ${product.price}</p>
                                <div className="stock-management">
                                    {editingStock === product.product_ID ? (
                                        <div className="stock-edit">
                                            <input
                                                type="number"
                                                value={newStock}
                                                onChange={(e) => setNewStock(e.target.value)}
                                                placeholder="New stock amount"
                                            />
                                            <button onClick={() => handleUpdateStock(product.product_ID)}>
                                                Save
                                            </button>
                                            <button onClick={() => {
                                                setEditingStock(null);
                                                setNewStock('');
                                            }}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p>Stock: {product.stock}</p>
                                            <button onClick={() => {
                                                setEditingStock(product.product_ID);
                                                setNewStock(product.stock.toString());
                                            }}>
                                                Update Stock
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button
                                className="remove-button"
                                onClick={() => handleRemoveProduct(product.product_ID)}
                            >
                                Remove Product
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default StoreDashboard;