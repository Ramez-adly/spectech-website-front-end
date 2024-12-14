import React from 'react';
import './StoreRegistration.css';

const StoreRegistration = ({navigate}) => {
    let storeName = '';
    let storeDescription = '';
    let location = '';
    let phoneNumber = '';
    let openingHours = '';
    let deliveryAvailable = false;
    let message = '';

    const registerStore = async () => {
        try {
            // First verify if user is authenticated and is a store owner
            const authResponse = await fetch('http://localhost:5555/check-auth', {
                credentials: 'include'
            });
            
            const authData = await authResponse.json();
            if (!authData.authenticated || authData.customertype !== 'store') {
                throw new Error('Please register as a store owner first');
            }

            const response = await fetch('http://localhost:5555/store/register', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName,
                    storeDescription,
                    location,
                    phoneNumber,
                    openingHours,
                    deliveryAvailable
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Store registration failed');
            }
            
            message = 'Store registration successful';
            alert(message);
            navigate('login');
        } catch (error) {
            message = error.message;
            alert(message);
            if (error.message.includes('Please register as a store owner first')) {
                navigate('register');
            }
        }
    };

    return (
        <div className="form-section">
            <h2>Store Registration</h2>
            <form>
                <input
                    type="text"
                    placeholder="Store Name"
                    onChange={(e) => (storeName = e.target.value)}
                    required
                />
                <textarea
                    placeholder="Store Description"
                    onChange={(e) => (storeDescription = e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Location"
                    onChange={(e) => (location = e.target.value)}
                    required
                />
                <input
                    type="tel"
                    placeholder="Phone Number"
                    onChange={(e) => (phoneNumber = e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Opening Hours"
                    onChange={(e) => (openingHours = e.target.value)}
                    required
                />
                <div className="switch-container">
                    <span className="switch-label">Delivery Available</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            onChange={(e) => (deliveryAvailable = e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
                <button type="button" onClick={registerStore}>
                    Register Store
                </button>
            </form>
        </div>
    );
};

export default StoreRegistration;