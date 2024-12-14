import React from 'react';
import './register.css';

const RegistrationForm = ({navigate}) => {
    let name = '';
    let email = '';
    let password = '';
    let customertype = 'customer';
    let message = '';
    let loading = false;

    const registerUser = async () => {
        try {
            loading = true;
            const response = await fetch('http://localhost:5555/users/register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, customertype }),
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            message = 'Registration successful';
            alert(message);

            if (customertype === 'store') {
                navigate('storeregistration');
            } else {
                navigate('login');
            }
        } catch (error) {
            message = error.message;
            alert(message);
        } finally {
            loading = false;
        }
    };

    return (
        <div className="form-section">
            <h2>User Registration</h2>
            <form>
                <input
                    type="text"
                    placeholder="Name"
                    onChange={(e) => (name = e.target.value)}
                    required
                />
                <br />
                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => (email = e.target.value)}
                    required
                />
                <br />
                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => (password = e.target.value)}
                    required
                />
                <br />
                <div className="switch-container">
                    <span className="switch-label">Customer</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            onChange={(e) => {
                                customertype = e.target.checked ? 'store' : 'customer';
                                console.log('Customer type changed to:', customertype);
                            }}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className="switch-label">Store Owner</span>
                </div>
                <button type="button" onClick={registerUser} disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
                <button type="button" className="login-with-google-btn">
                    Sign up with Google
                </button>
                <p className="login-link">
                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('login'); }}>Login here</a>
                </p>
            </form>
        </div>
    );
};

export default RegistrationForm;