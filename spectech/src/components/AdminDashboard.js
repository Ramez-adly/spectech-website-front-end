import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ navigate }) => {
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
        fetchData();
    }, [activeTab]);

    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:5555/check-auth', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (!response.ok || !data.isAdmin) {
                navigate('login');
                return;
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            navigate('login');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'users':
                    const usersResponse = await fetch('http://localhost:5555/users', {
                        credentials: 'include'
                    });
                    const usersData = await usersResponse.json();
                    setUsers(usersData);
                    break;
                case 'stores':
                    const storesResponse = await fetch('http://localhost:5555/stores', {
                        credentials: 'include'
                    });
                    const storesData = await storesResponse.json();
                    setStores(storesData);
                    break;
                case 'products':
                    const productsResponse = await fetch('http://localhost:5555/products', {
                        credentials: 'include'
                    });
                    const productsData = await productsResponse.json();
                    setProducts(productsData);
                    break;
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5555/admin/${type}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to delete ${type.slice(0, -1)}`);
            }

            alert(data.message || `${type.slice(0, -1)} deleted successfully`);
            fetchData(); // Refresh the data
        } catch (err) {
            alert(err.message);
            console.error('Delete error:', err);
        }
    };

    const renderTable = () => {
        if (loading) {
            return <div className="loading">Loading...</div>;
        }

        if (error) {
            return <div className="error">{error}</div>;
        }

        switch (activeTab) {
            case 'users':
                return (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.ID}>
                                    <td>{user.ID}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(user.ID, 'users')}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'stores':
                return (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Store Name</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store.ID}>
                                    <td>{store.ID}</td>
                                    <td>{store.storeName}</td>
                                    <td>{store.location}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(store.ID, 'stores')}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'products':
                return (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.ID}>
                                    <td>{product.ID}</td>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(product.ID, 'products')}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <div className="tabs">
                <button 
                    className={activeTab === 'users' ? 'active' : ''} 
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button 
                    className={activeTab === 'stores' ? 'active' : ''} 
                    onClick={() => setActiveTab('stores')}
                >
                    Stores
                </button>
                <button 
                    className={activeTab === 'products' ? 'active' : ''} 
                    onClick={() => setActiveTab('products')}
                >
                    Products
                </button>
            </div>
            <div className="table-container">
                {renderTable()}
            </div>
        </div>
    );
};

export default AdminDashboard;
