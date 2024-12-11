import React from 'react';
import './navbar.css';

const Navbar = ({ navigate }) => {
  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate('home')}>SpecTech</div>
      <ul>
        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Home</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('products'); }}>Products</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('about'); }}>About</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('contact'); }}>Contact</a></li>
        
        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('login'); }}>Login</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('register'); }}>Register</a></li>
      </ul>
    </div>
  );
};

export default Navbar;