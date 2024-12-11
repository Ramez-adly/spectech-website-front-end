import React from 'react';
import './register.css';

const RegistrationForm = ({navigate}) => {
    let name = '';
    let email = '';
    let password = '';
    let customertype = 'regular';
    let message = '';
    
    const registerUser = () => {
        fetch('http://localhost:123/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, customertype }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            message = 'Registration successful';
            alert(message);
            if (customertype === 'store') {
                navigate('storeregistration');
            } else {
                navigate('home');
            }
        })
        .catch((error) => {
            message = error.message;
            alert(message);
        });
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
                            onChange={(e) => (customertype = e.target.checked ? 'store' : 'regular')}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className="switch-label">Store Owner</span>
                </div>
                <button type="button" onClick={registerUser}>
                    Register
                </button>
                <p>
                    Already have an account?{' '}
                    <span 
                        onClick={() => navigate('login')}
                        style={{ color: 'blue', cursor: 'pointer' }}
                    >
                        Login here
                    </span>
                </p>
            </form>
        </div>
    );
};

export default RegistrationForm;