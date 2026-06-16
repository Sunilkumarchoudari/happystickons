"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCurrency } from '@/context/CurrencyContext';

export default function Profile() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setUser(data.user);
          fetchOrders(data.user.email);
        } else {
          localStorage.removeItem('customerToken');
          toast.error('Session expired, please log in again.');
          router.push('/login');
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);

  const fetchOrders = async (email: string) => {
    try {
      const res = await fetch(`/api/orders?email=${email}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to fetch user orders', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading profile...</div>;

  return (
    <div className="container" style={{ minHeight: '60vh', padding: '3rem 0' }}>
      <h1 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-comfortaa), sans-serif' }}>👤 My Profile</h1>
      
      <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto', background: 'rgba(255,255,255,0.9)' }}>
        {user ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--background)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem', marginBottom: '0.3rem', fontFamily: 'var(--font-comfortaa), sans-serif' }}>{user.name}</h2>
                <p style={{ color: 'var(--secondary)', fontSize: '1.05rem', fontWeight: 500 }}>{user.email}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontFamily: 'var(--font-comfortaa), sans-serif' }}>Account Actions</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn-primary" onClick={() => router.push('/create')} style={{ flex: 1 }}>
                  ✨ Create Magnets
                </button>
                <button onClick={handleLogout} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', fontWeight: 'bold', cursor: 'pointer' }}>
                  Log Out
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-comfortaa), sans-serif' }}>📦 My Order History</h3>
              {ordersLoading ? (
                <div style={{ color: 'var(--secondary)' }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ color: 'var(--secondary)', fontStyle: 'italic' }}>No orders found yet. Start designing your first magnet!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {orders.map((order) => (
                    <div key={order._id} style={{ background: 'rgba(236,231,218,0.5)', padding: '20px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.95rem' }}>Order:</span>
                          <span style={{ fontFamily: 'monospace', marginLeft: '0.5rem', color: 'var(--secondary)' }}>#{order._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '15px', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold', 
                            color: order.orderStatus === 'delivered' ? '#88d9c0' : order.orderStatus === 'shipped' ? '#88acd9' : '#e69a8d',
                            background: 'var(--primary)'
                          }}>
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={item.photoUrl} alt="custom magnet" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{item.shape} Magnet</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Qty: {item.quantity} | Size: {item.size || '2.5" x 2.5"'}</div>
                            </div>
                            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>
                              {order.currency === 'USD' ? `$${(item.price * item.quantity).toFixed(2)}` : `₹${Math.round(item.price * item.quantity)}`}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                        <span>Total Paid</span>
                        <span>
                          {order.currency === 'USD' ? `$${order.totalAmount.toFixed(2)}` : `₹${Math.round(order.totalAmount)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>User not found.</div>
        )}
      </div>
    </div>
  );
}
