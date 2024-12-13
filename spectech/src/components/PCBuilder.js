import React, { useState, useEffect } from 'react';
import './PCBuilder.css';

const PCBuilder = () => {
    const [components, setComponents] = useState({
        Processor: null,
        Motherboard: null,
        'CPU Cooler': null,
        Case: null,
        'Graphics Card': null,
        RAM: null,
        Storage: null,
        'Case Cooler': null,
        'Power Supply': null,
        Monitor: null
    });

    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState('');

    // Check authentication status on component mount
    useEffect(() => {
        fetch('http://localhost:5555/check-auth', {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            setIsAuthenticated(data.authenticated);
            setUserType(data.customertype);
        })
        .catch(error => console.error('Auth check error:', error));
    }, []);

    useEffect(() => {
        const total = Object.values(components)
            .reduce((sum, component) => sum + (component?.price || 0), 0);
        setTotalPrice(total);
    }, [components]);

    const handleAddComponent = async (category) => {
        setSelectedCategory(category);
        try {
            const response = await fetch('http://localhost:5555/products', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch products');
            
            const data = await response.json();
            const filteredProducts = data.filter(
                product => product.category.toLowerCase() === category.toLowerCase()
            );
            setProducts(filteredProducts);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Error loading products. Please try again.');
        }
    };

    const removeComponent = (category) => {
        setComponents(prevComponents => ({
            ...prevComponents,
            [category]: null
        }));
    };

    const selectProduct = (category, product) => {
        setComponents(prevComponents => ({
            ...prevComponents,
            [category]: product
        }));
        setShowModal(false);
    };

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            alert('Please log in to make a purchase');
            return;
        }

        const missingComponents = Object.entries(components)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingComponents.length > 0) {
            alert(`Please select all components before purchasing. Missing: ${missingComponents.join(', ')}`);
            return;
        }

        try {
            for (const [category, component] of Object.entries(components)) {
                if (component) {
                    const response = await fetch('http://localhost:5555/purchase', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            productID: component.ID,
                            quantity: 1 // Assuming quantity is 1 for each component
                        })
                    });

                    if (!response.ok) {
                        const error = await response.text();
                        throw new Error(error);
                    }
                }
            }
    
            alert('PC build purchased successfully!');
            setComponents({
                Processor: null,
                Motherboard: null,
                'CPU Cooler': null,
                Case: null,
                'Graphics Card': null,
                RAM: null,
                Storage: null,
                'Case Cooler': null,
                'Power Supply': null,
                Monitor: null
            });
        } catch (error) {
            alert('Error purchasing components: ' + error.message);
        }
    };
    return (
        <div className="pc-builder-container">
            <h2>PC Builder</h2>
            <div className="total-price">
                Total Price: ${totalPrice.toFixed(2)}
            </div>
            
            <table className="components-table">
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Product</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(components).map(([category, component]) => (
                        <tr key={category}>
                            <td>{category}</td>
                            <td>
                                {component ? (
                                    <img 
                                        src={component.image_url} 
                                        alt={component.name}
                                        className="component-image"
                                    />
                                ) : 'Not selected'}
                            </td>
                            <td>{component?.name || 'Not selected'}</td>
                            <td>${component?.price?.toFixed(2) || '0.00'}</td>
                            <td>
                                {component ? (
                                    <button 
                                        onClick={() => removeComponent(category)}
                                        className="remove-btn"
                                    >
                                        Remove
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleAddComponent(category)}
                                        className="add-btn"
                                    >
                                        Add Component
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button 
                onClick={handlePurchase}
                className="purchase-btn"
                disabled={Object.values(components).some(comp => !comp)}
                >
                Purchase Build
            </button>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Select {selectedCategory}</h3>
                        <button onClick={() => setShowModal(false)} className="close-btn">×</button>
                        <div className="products-grid">
                            {products.map(product => (
                                <div 
                                    key={product.ID} 
                                    className="product-card"
                                    onClick={() => selectProduct(selectedCategory, product)}
                                >
                                    <img src={product.image_url} alt={product.name} />
                                    <h4>{product.name}</h4>
                                    <p>${product.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PCBuilder;