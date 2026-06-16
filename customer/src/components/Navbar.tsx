"use client";
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { currency, setCurrency } = useCurrency();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="180" height="90" viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg">
            {/* Logo Icon */}
            <g transform="translate(360,40)">
              <polygon points="0,30 30,0 60,30 30,60" fill="#B49D85" stroke="#88644F" strokeWidth="3"/>
              <polygon points="15,30 30,15 45,30 30,45" fill="#ECE7DA" stroke="#88644F" strokeWidth="2"/>
            </g>
            {/* Company Name */}
            <text x="50" y="85" fontFamily="Georgia, serif" fontSize="48" fontStyle="italic" fontWeight="bold" fill="#4F2C1F">Happy</text>
            <text x="40" y="145" fontFamily="Arial, sans-serif" fontSize="58" fontWeight="700" fill="#88644F">Stick Ons</text>
            <text x="110" y="185" fontFamily="Arial, sans-serif" fontSize="22" fill="#88644F">Memory Magnets</text>
          </svg>
        </Link>
        <div className="search-bar">
          <input type="text" placeholder="Search for magnets, shapes..." />
          <button>🔍</button>
        </div>
        <div className="nav-links">
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD')}
            style={{ padding: '8px 12px', borderRadius: '20px', border: '1px solid #B49D85', background: '#ECE7DA', color: '#4F2C1F', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>
          
          {isLoggedIn ? (
            <Link href="/profile" style={{ background: 'var(--primary)', color: '#fff', padding: '6px 15px', borderRadius: '20px' }}>👤 Profile</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}

          <Link href="/create">Customizer</Link>
          <Link href="/checkout" className="cart-icon">🛒 Cart</Link>
        </div>
      </div>
      <div className="nav-categories">
        <Link href="/create?shape=square">Squares</Link>
        <Link href="/create?shape=round">Rounds</Link>
        <Link href="/create?shape=polaroid">Polaroids</Link>
        <Link href="/create?shape=heart">Hearts</Link>
      </div>
    </nav>
  );
}
