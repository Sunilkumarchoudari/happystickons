"use client";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import BannerCarousel from '@/components/BannerCarousel';
import { useCurrency } from '@/context/CurrencyContext';
import InstagramEmbed from '@/components/InstagramEmbed';
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function Home() {
  const { formatPrice } = useCurrency();
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Failed to fetch products', err));
  }, []);

  const checkDelivery = () => {
    if (pincode.length >= 5) {
      setDeliveryMsg("✨ Great news! We deliver to your area in 2-3 business days.");
    } else {
      setDeliveryMsg("❌ Please enter a valid pincode.");
    }
  };

  return (
    <>
      <Scene />
      
      {/* Top Banner */}
      <div style={{ background: 'var(--accent)', padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#fff', zIndex: 100, position: 'relative', borderBottom: '2px solid white' }}>
        🎉 Special Offer: Get 20% OFF on your first order! Use code HAPPY20 at checkout. 🎁
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Hero Section */}
        <BannerCarousel />

        {/* Printshoppy-style Category Grid */}
        <section className="section-wrapper bg-pastel-mint">
          <h2 className="section-title text-pastel-pink" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>✨ Shop By Shape</h2>
          <p className="text-pastel-blue" style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '3rem', fontWeight: 600 }}>Select a shape to start customizing with your photos.</p>
          
          <div className="category-grid">
            {products.length > 0 ? (
              products.map(product => {
                const shapeLower = product.shape.toLowerCase();
                const price = product.sizeOptions?.length > 0 ? product.sizeOptions[0].price : 4.99;
                
                // Get visual style/emoji based on shape
                let emoji = '🟩';
                let shapeStyle: React.CSSProperties = { transform: 'rotate(0deg)', background: '#fff', width: '120px', height: '120px', borderRadius: '15px', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
                
                if (shapeLower === 'round') {
                  emoji = '🔵';
                  shapeStyle = { transform: 'rotate(0deg)', background: '#fff', width: '120px', height: '120px', borderRadius: '50%', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
                } else if (shapeLower === 'polaroid') {
                  emoji = '📸';
                  shapeStyle = { transform: 'rotate(0deg)', background: '#fff', width: '140px', height: '100px', borderRadius: '5px', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', border: '5px solid #fff', borderBottom: '25px solid #fff' };
                } else if (shapeLower === 'heart') {
                  emoji = '💖';
                  shapeStyle = { transform: 'rotate(45deg)', background: '#fff', width: '100px', height: '100px', borderRadius: '5px 50px 50px 50px', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
                } else {
                  emoji = '✨';
                  shapeStyle = { transform: 'rotate(0deg)', background: 'linear-gradient(135deg, #fff, #ffe)', width: '120px', height: '120px', borderRadius: '20px', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
                }
                
                return (
                  <div key={product._id} className="product-card">
                    <div className="product-image-placeholder">
                      <span style={shapeStyle}></span>
                    </div>
                    <h3>{emoji} {product.name}</h3>
                    <div className="price">From {formatPrice(price)}</div>
                    <div><Link href={`/create?shape=${shapeLower}`} className="btn-primary">Customize</Link></div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="product-card">
                  <div className="product-image-placeholder">
                    <span style={{ transform: 'rotate(0deg)', background: '#fff', width: '120px', height: '120px', borderRadius: '15px', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}></span>
                  </div>
                  <h3>🟩 Square Magnets</h3>
                  <div className="price">From {formatPrice(4.99)}</div>
                  <div><Link href="/create?shape=square" className="btn-primary">Customize</Link></div>
                </div>

                <div className="product-card">
                  <div className="product-image-placeholder">
                    <span style={{ transform: 'rotate(0deg)', background: '#fff', width: '120px', height: '120px', borderRadius: '50%', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}></span>
                  </div>
                  <h3>🔵 Round Magnets</h3>
                  <div className="price">From {formatPrice(4.99)}</div>
                  <div><Link href="/create?shape=round" className="btn-primary">Customize</Link></div>
                </div>

                <div className="product-card">
                  <div className="product-image-placeholder">
                    <span style={{ transform: 'rotate(0deg)', background: '#fff', width: '140px', height: '100px', borderRadius: '5px', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', border: '5px solid #fff', borderBottom: '25px solid #fff' }}></span>
                  </div>
                  <h3>📸 Mini Polaroids</h3>
                  <div className="price">From {formatPrice(5.99)}</div>
                  <div><Link href="/create?shape=polaroid" className="btn-primary">Customize</Link></div>
                </div>

                <div className="product-card">
                  <div className="product-image-placeholder">
                    <span style={{ transform: 'rotate(45deg)', background: '#fff', width: '100px', height: '100px', borderRadius: '5px 50px 50px 50px', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}></span>
                  </div>
                  <h3>💖 Heart Magnets</h3>
                  <div className="price">From {formatPrice(6.99)}</div>
                  <div><Link href="/create?shape=heart" className="btn-primary">Customize</Link></div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Delivery Checker Section */}
        <section className="section-wrapper" style={{ background: '#fff' }}>
          <h2 className="section-title text-pastel-mint" style={{ textShadow: '1px 1px 0 var(--secondary)' }}>🚚 Fast & Secure Delivery</h2>
          <p className="text-pastel-blue" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Check if we deliver to your pincode!</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', maxWidth: '500px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Enter Pincode..." 
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              style={{ padding: '15px 20px', borderRadius: '30px', border: '2px solid #fff', fontSize: '1.1rem', flex: 1, outline: 'none' }}
            />
            <button onClick={checkDelivery} className="btn-primary" style={{ padding: '15px 30px' }}>Check</button>
          </div>
          {deliveryMsg && <p style={{ marginTop: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#FF6B6B' }}>{deliveryMsg}</p>}
        </section>

        {/* Reviews Section */}
        <section className="section-wrapper glass-card">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', textShadow: '2px 2px 4px rgba(255,255,255,0.5)' }}>⭐ What Our Customers Say</h2>
          <div className="grid" style={{ marginTop: 0 }}>
            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <div style={{ fontSize: '1.5rem', color: '#FFD700', marginBottom: '1rem' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#444' }}>"The glossy finish is amazing! The colors popped perfectly. Will definitely order more."</p>
              <p style={{ fontWeight: 'bold' }}>- Sarah J.</p>
            </div>
            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <div style={{ fontSize: '1.5rem', color: '#FFD700', marginBottom: '1rem' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#444' }}>"Super fast delivery and the 3D preview was exactly what I got in the mail!"</p>
              <p style={{ fontWeight: 'bold' }}>- Michael R.</p>
            </div>
            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <div style={{ fontSize: '1.5rem', color: '#FFD700', marginBottom: '1rem' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#444' }}>"I ordered the polaroid magnets for my wedding guests. Everyone loved them!"</p>
              <p style={{ fontWeight: 'bold' }}>- Emily W.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="#" className="btn-primary" style={{ background: 'var(--secondary)' }}>📝 Leave a Review</Link>
          </div>
        </section>

        {/* Instagram Feed Section */}
        <section className="section-wrapper bg-pastel-blue">
          <h2 className="section-title text-pastel-pink">📸 Instagram Love</h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            Tag us <span className="text-pastel-peach">@happystickons</span> to get featured!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <InstagramEmbed url="https://www.instagram.com/reel/DYbotwfPWzm/" />
            <InstagramEmbed url="https://www.instagram.com/reel/DZNPmu-P1FJ/" />
            <InstagramEmbed url="https://www.instagram.com/reel/DYFJLgyvVJV/" />
          </div>
        </section>

        {/* Value Proposition */}
        <section style={{ marginTop: '2rem', marginBottom: '5rem' }}>
          <div className="grid" style={{ marginTop: 0 }}>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
              <h3 style={{ fontSize: '1.8rem' }}>Premium Glossy</h3>
              <p style={{ color: '#34495e', fontWeight: 500, fontSize: '1.1rem' }}>Our magnets are printed on high-quality glossy material to make your photos pop.</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧊</div>
              <h3 style={{ fontSize: '1.8rem' }}>3D Live Preview</h3>
              <p style={{ color: '#34495e', fontWeight: 500, fontSize: '1.1rem' }}>See exactly what your magnet will look like before you buy.</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.8rem' }}>Fast Shipping</h3>
              <p style={{ color: '#34495e', fontWeight: 500, fontSize: '1.1rem' }}>Get your custom magnets delivered quickly and securely.</p>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
