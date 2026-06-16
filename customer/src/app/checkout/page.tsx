"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCurrency } from '@/context/CurrencyContext';

export default function Checkout() {
  const router = useRouter();
  const { currency, formatPrice } = useCurrency();
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Cart
    const savedCart = localStorage.getItem('happy_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
        if (parsed.length === 0) {
          toast.error('Your cart is empty');
          router.push('/create');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      toast.error('Your cart is empty');
      router.push('/create');
    }

    // 2. Fetch User & Enforce Login (Remove Guest Checkout)
    const fetchUser = async () => {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        toast.error('Please login or register to checkout');
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('customerToken');
          toast.error('Session expired. Please login again');
          router.push('/login');
        }
      } catch(e) {
        toast.error('Authentication error. Please login');
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  // Convert USD base price to current currency
  const getPricePerMagnet = (usdPrice: number = 4.99) => {
    return currency === 'INR' ? usdPrice * 83 : usdPrice;
  };

  const totalAmount = cart.reduce((sum, item) => sum + (getPricePerMagnet(item.price) * item.quantity), 0);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return toast.error('Shipping address is required');
    if (cart.length === 0) return toast.error('Your cart is empty');
    if (!user) return toast.error('You must be logged in to checkout');
    
    setIsProcessing(true);
    try {
      const orderItems = cart.map(item => ({
        photoUrl: item.photo,
        shape: item.shape,
        size: '2.5" x 2.5"', // Default size
        quantity: item.quantity,
        price: getPricePerMagnet(item.price)
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: user.name,
          email: user.email,
          address,
          items: orderItems,
          totalAmount,
          currency
        })
      });
      
      if (res.ok) {
        toast.success('Order placed successfully! 🎉');
        localStorage.removeItem('happy_cart'); // Clear cart
        router.push('/profile');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to place order');
      }
    } catch(err) {
      toast.error('Network error');
    } finally {
      setIsProcessing(false);
    }
  };

  const displayPrice = (val: number) => {
    if (currency === 'INR') {
      return `₹${Math.round(val)}`;
    }
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="container" style={{ minHeight: '60vh', padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.9)' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-comfortaa), sans-serif' }}>Secure Checkout</h1>
        
        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>Shipping Address</label>
            <textarea 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              required 
              rows={4}
              placeholder="Enter your full shipping address..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', resize: 'none', fontFamily: 'inherit', fontSize: '1rem' }}
            />
          </div>
          
          <div style={{ background: 'rgba(236,231,218,0.5)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-comfortaa), sans-serif' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-dark)', fontWeight: '500' }}>
                    {item.shape} Magnet x {item.quantity}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>
                    {displayPrice(getPricePerMagnet(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem', color: 'var(--primary)', borderTop: '2px solid var(--glass-border)', paddingTop: '0.8rem' }}>
              <span>Total</span>
              <span>{displayPrice(totalAmount)}</span>
            </div>
          </div>

          <button type="submit" disabled={isProcessing} className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '15px', fontSize: '1.2rem', opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? 'Processing...' : `Confirm Order & Pay (${displayPrice(totalAmount)})`}
          </button>
        </form>
      </div>
    </div>
  );
}
