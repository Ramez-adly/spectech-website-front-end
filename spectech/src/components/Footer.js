import React from 'react';
import './Footer.css';

const Footer = ({ navigate }) => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Our Store</h3>
                    <ul>
                        <li onClick={() => navigate('home')}>Home</li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Customer Service</h3>
                    <ul>
                        <li>Shipping Information</li>
                        <li>Returns & Exchanges</li>
                        <li>FAQ</li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contact Information</h3>
                    <ul>
                        <li>Email: support@spectech.com</li>
                        <li>Phone: (+20) 0123459988</li>
                        <li>Address: el 3asema</li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Follow Us</h3>
                    <ul>
                        <li>Facebook</li>
                        <li>Twitter</li>
                        <li>Instagram</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 SpecTech. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
