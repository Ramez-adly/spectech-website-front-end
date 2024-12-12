import React from 'react';
import './Home.css';

const Home = ({ navigate }) => {
    return (
        <div className="home-container">
            <div className="hero-section">
                <div className="hero-background">
                    <img src={process.env.PUBLIC_URL + '/images/homepage.jpeg'} alt="Hero background" />
                </div>
                <div className="hero-content">
                    <h1>Welcome to SpecTech</h1>
                    <p>Your one-stop destination for premium computer hardware and accessories</p>
                    <button onClick={() => navigate('products')} className="cta-button">
                        Explore Products
                    </button>
                </div>
            </div>

            <div className="features-section">
                <div className="feature-card">
                    <i className="fas fa-microchip"></i>
                    <h3>Premium Hardware</h3>
                    <p>Top-quality computer components from leading manufacturers</p>
                </div>
                <div className="feature-card">
                    <i className="fas fa-truck"></i>
                    <h3>Fast Delivery</h3>
                    <p>Quick and reliable shipping to your doorstep</p>
                </div>
                <div className="feature-card">
                    <i className="fas fa-headset"></i>
                    <h3>Expert Support</h3>
                    <p>Professional technical support and advice</p>
                </div>
            </div>

            <div className="categories-section">
                <h2>Popular Categories</h2>
                <div className="categories-grid">
                    <div className="category-card" onClick={() => navigate('products')}>
                        <h4>Processors</h4>
                        <p>High-performance CPUs</p>
                    </div>
                    <div className="category-card" onClick={() => navigate('products')}>
                        <h4>Graphics Cards</h4>
                        <p>Latest GPU technology</p>
                    </div>
                    <div className="category-card" onClick={() => navigate('products')}>
                        <h4>Peripherals</h4>
                        <p>Keyboards, mice, and more</p>
                    </div>
                    <div className="category-card" onClick={() => navigate('products')}>
                        <h4>Storage</h4>
                        <p>SSDs and hard drives</p>
                    </div>
                </div>
            </div>

            <div className="about-section">
                <h2>Why Choose SpecTech?</h2>
                <div className="about-content">
                    <div className="about-text">
                        <p>At SpecTech, we're passionate about providing the best computer hardware solutions to our customers. With years of experience in the industry, we understand what matters most to tech enthusiasts and professionals alike.</p>
                        <ul>
                            <li>✓ Competitive prices</li>
                            <li>✓ Genuine products</li>
                            <li>✓ Expert technical support</li>
                            <li>✓ Fast shipping</li>
                        </ul>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;