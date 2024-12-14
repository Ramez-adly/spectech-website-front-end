import React from 'react';
import './navbar.css';
import { useState, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const Navbar = ({ navigate }) => {
  const [userType, setUserType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
        checkAuth();
    };
    
    const updateCartCount = () => {
        const savedCart = document.cookie
            .split('; ')
            .find(row => row.startsWith('cart='));
        if (savedCart) {
            const cart = JSON.parse(decodeURIComponent(savedCart.split('=')[1]));
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
        } else {
            setCartCount(0);
        }
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('cart-update', updateCartCount);
    
    checkAuth();
    updateCartCount();
    
    return () => {
        window.removeEventListener('auth-change', handleAuthChange);
        window.removeEventListener('cart-update', updateCartCount);
    };
}, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5555/check-auth', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data.authenticated) {
        setUserType(data.customertype);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserType(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUserType(null);
    }
  };
  
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5555/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      setIsLoggedIn(false);
      setUserType(null);
      window.dispatchEvent(new Event('auth-change'));
      navigate('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

    const commonLinks = (
        <>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Home</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('products'); }}>Products</a></li>
        </>
    );
    const renderNavLinks = () => {

    // If not logged in, show login and register options
    if (!isLoggedIn) {
        return (
            <>
                {commonLinks}
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('login'); }}>Login</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('register'); }}>Register</a></li>

            </>
        );
    }

    // User is logged in, show options based on customertype
    switch (userType) {
      case 'customer':
          return (
              <>
                  {commonLinks}
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('PCBuilder'); }}>PC Builder</a></li>
                  <li className="cart-icon-container">
                      <a href="#" onClick={(e) => { e.preventDefault(); navigate('cart'); }}>
                        <FaShoppingCart />
                        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                    </a>
                </li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a></li>
              </>
          );

      case 'store':
          return (
              <>
                  {commonLinks}
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('store-dashboard'); }}>Store Dashboard</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a></li>
              </>
          );

      case 'admin':
          return (
              <>
                  {commonLinks}
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('AdminDashboard'); }}>Admin Dashboard</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a></li>
              </>
          );

      default:
          return commonLinks;
  }
};

return (
  <div className="navbar">
      <div className="logo" onClick={() => navigate('home')}>SpecTech</div>
      <ul className="nav-links">
          {renderNavLinks()}
      </ul>
  </div>
);
};

export default Navbar;