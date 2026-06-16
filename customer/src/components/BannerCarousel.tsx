"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BannerItem {
  _id?: string;
  title: string;
  subtitle: string;
  bgGradient: string;
  textColor: string;
  linkUrl: string;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        if (res.ok) {
          const data = await res.json();
          setBanners(data);
        }
      } catch (e) {
        console.error('Failed to load homepage banners', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (loading) {
    return (
      <div style={{ width: '100%', height: '400px', borderRadius: '30px', background: 'rgba(236,231,218,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', border: '1px solid var(--glass-border)' }}>
        <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Loading banners...</p>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '30px', overflow: 'hidden', marginTop: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
      {banners.map((banner, idx) => (
        <div 
          key={banner._id || idx}
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: banner.bgGradient, 
            color: banner.textColor || '#fff',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            opacity: idx === current ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: idx === current ? 10 : 0
          }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: banner.textColor || '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.2)', fontFamily: 'var(--font-comfortaa), sans-serif' }}>{banner.title}</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 500, fontFamily: 'var(--font-quicksand), sans-serif' }}>{banner.subtitle}</p>
          <Link href={banner.linkUrl || '/create'} className="btn-primary" style={{ background: '#fff', color: '#4F2C1F', border: 'none', fontSize: '1.2rem', padding: '15px 40px' }}>
            Shop Now
          </Link>
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 20 }}>
        {banners.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrent(idx)}
            style={{ 
              width: '12px', height: '12px', borderRadius: '50%', 
              background: idx === current ? '#fff' : 'rgba(255,255,255,0.4)', 
              border: 'none', cursor: 'pointer', transition: 'all 0.3s' 
            }}
          />
        ))}
      </div>
    </div>
  );
}
