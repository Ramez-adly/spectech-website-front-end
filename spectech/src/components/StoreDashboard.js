import React, { useState, useEffect } from 'react';
import './StoreDashboard.css';

const StoreDashboard = () => {
    const [storeInfo, setStoreInfo] = useState(null);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        productID: '',
        price: '',
        stock: ''
    });
    const [editMode, setEditMode] = useState({});

    useEffect(() => {
        fetchStoreInfo();
        fetchAllProducts();
    }, []);

    useEffect(() => {
        if (storeInfo) {
            fetchStoreProducts();
        }
    }, [storeInfo]);

    const fetchStoreInfo = async () => {
        try {
            const response = await fetch('http://localhost:5555/stores/user', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch store info');
            const data = await response.json();
            setStoreInfo(data);
        } catch (error) {
            console.error('Error fetching store info:', error);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const response = await fetch('http://localhost:5555/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setAllProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchStoreProducts = async () => {
        try {
            const response = await fetch(`http://localhost:5555/stores/${storeInfo.storeId}/products`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch store products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching store products:', error);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `http://localhost:5555/stores/${storeInfo.storeId}/products/add`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(newProduct)
                }
            );
            if (!response.ok) throw new Error('Failed to add product');
            await fetchStoreProducts();
            setNewProduct({ productID: '', price: '', stock: '' });
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const response = await fetch(
                `http://localhost:5555/stores/${storeInfo.storeId}/products/${productId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );
            if (!response.ok) throw new Error('Failed to delete product');
            await fetchStoreProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleEditStock = async (productId, newStock) => {
        try {
            const response = await fetch(
                `http://localhost:5555/products/edit/${productId}/${newStock}`,
                {
                    method: 'PUT',
                    credentials: 'include'
                }
            );
            if (!response.ok) throw new Error('Failed to update stock');
            await fetchStoreProducts();
            setEditMode({ ...editMode, [productId]: false });
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    if (!storeInfo) {
        return <div>Loading store information...</div>;
    }

    return (
        <div className="store-dashboard">
            <h1>{storeInfo.storeName} Dashboard</h1>
            
            <div className="add-product-section">
                <h2>Add New Product</h2>
                <form onSubmit={handleAddProduct}>
                    <select
                        value={newProduct.productID}
                        onChange={(e) => setNewProduct({ ...newProduct, productID: e.target.value })}
                        required
                    >
                        <option value="">Select a product</option>
                        {allProducts.map(product => (
                            <option key={product.ID} value={product.ID}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Stock"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        required
                    />
                    <button type="submit">Add Product</button>
                </form>
            </div>

            <div className="products-list">
                <h2>Store Products</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.ID}>
                                <td>{product.name}</td>
                                <td>${product.store_price}</td>
                                <td>
                                    {editMode[product.ID] ? (
                                        <input
                                            type="number"
                                            defaultValue={product.stock}
                                            onBlur={(e) => handleEditStock(product.ID, e.target.value)}
                                        />
                                    ) : (
                                        <span onClick={() => setEditMode({ ...editMode, [product.ID]: true })}>
                                            {product.stock}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleDeleteProduct(product.ID)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StoreDashboard;