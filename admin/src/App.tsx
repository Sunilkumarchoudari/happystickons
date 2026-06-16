import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './index.css';

interface OrderItem {
  photoUrl: string;
  shape: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName: string;
  email: string;
  address?: string;
  items: OrderItem[];
  totalAmount: number;
  currency?: string;
  orderStatus: string;
  createdAt: string;
}

interface Product {
  _id?: string;
  name: string;
  shape: string;
  sizeOptions: { size: string; price: number }[];
  isActive: boolean;
}

interface Banner {
  _id?: string;
  title: string;
  subtitle: string;
  bgGradient: string;
  textColor: string;
  linkUrl: string;
  isActive: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [usdToInrRate, setUsdToInrRate] = useState(83); // Settings configuration
  
  const [loading, setLoading] = useState(true);

  // Products CRUD State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodShape, setProdShape] = useState('Square');
  const [prodSize, setProdSize] = useState('2.5" x 2.5"');
  const [prodPrice, setProdPrice] = useState(4.99);
  const [prodActive, setProdActive] = useState(true);

  // Banners CRUD State
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBg, setBannerBg] = useState('linear-gradient(135deg, #4F2C1F, #88644F)');
  const [bannerTextCol, setBannerTextCol] = useState('#FFFFFF');
  const [bannerLink, setBannerLink] = useState('/create');
  const [bannerActive, setBannerActive] = useState(true);

  // Decodes base64 JPEG data URL and downloads it as a real binary image file
  const downloadBase64Image = (base64Data: string, fileName: string) => {
    try {
      if (!base64Data.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      const parts = base64Data.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (e) {
      console.error('Failed to download image', e);
      toast.error('Failed to download image file');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      fetchOrders();
      fetchCustomers();
      fetchProducts();
      fetchBanners();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        toast.success('Welcome back, Admin!');
        fetchOrders();
        fetchCustomers();
        fetchProducts();
        fetchBanners();
      } else {
        toast.error(data.error || 'Invalid Credentials');
        setAuthError(data.error || 'Invalid Credentials');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
      setAuthError('Failed to connect to server');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    toast('Logged out securely.', { icon: '🔒' });
    setOrders([]);
    setCustomers([]);
    setProducts([]);
    setBanners([]);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/customers`);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/banners`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch banners', error);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Connection error');
      console.error('Failed to update status', error);
    }
  };

  // Products CRUD
  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      shape: prodShape,
      sizeOptions: [{ size: prodSize, price: Number(prodPrice) }],
      isActive: prodActive
    };

    try {
      let res;
      if (editingProduct && editingProduct._id) {
        res = await fetch(`${API_URL}/admin/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/admin/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!');
        resetProductForm();
        fetchProducts();
      } else {
        toast.error('Failed to save product');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdShape(prod.shape);
    setProdSize(prod.sizeOptions[0]?.size || '2.5" x 2.5"');
    setProdPrice(prod.sizeOptions[0]?.price || 4.99);
    setProdActive(prod.isActive);
    setShowProductForm(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdShape('Square');
    setProdSize('2.5" x 2.5"');
    setProdPrice(4.99);
    setProdActive(true);
    setShowProductForm(false);
  };

  // Banners CRUD
  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: bannerTitle,
      subtitle: bannerSubtitle,
      bgGradient: bannerBg,
      textColor: bannerTextCol,
      linkUrl: bannerLink,
      isActive: bannerActive
    };

    try {
      let res;
      if (editingBanner && editingBanner._id) {
        res = await fetch(`${API_URL}/admin/banners/${editingBanner._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/admin/banners`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        toast.success(editingBanner ? 'Banner updated!' : 'Banner created!');
        resetBannerForm();
        fetchBanners();
      } else {
        toast.error('Failed to save banner');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const startEditBanner = (ban: Banner) => {
    setEditingBanner(ban);
    setBannerTitle(ban.title);
    setBannerSubtitle(ban.subtitle);
    setBannerBg(ban.bgGradient);
    setBannerTextCol(ban.textColor);
    setBannerLink(ban.linkUrl);
    setBannerActive(ban.isActive);
    setShowBannerForm(true);
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Banner deleted');
        fetchBanners();
      } else {
        toast.error('Failed to delete banner');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const resetBannerForm = () => {
    setEditingBanner(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerBg('linear-gradient(135deg, #4F2C1F, #88644F)');
    setBannerTextCol('#FFFFFF');
    setBannerLink('/create');
    setBannerActive(true);
    setShowBannerForm(false);
  };

  // Convert prices based on stored currency
  const formatOrderPrice = (amount: number, currency = 'INR') => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  const calculateRevenue = () => {
    return orders.reduce((sum, o) => {
      if (o.currency === 'USD') {
        return sum + (o.totalAmount * usdToInrRate);
      }
      return sum + o.totalAmount;
    }, 0);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#ECE7DA' }}>
        <Toaster position="top-right" />
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '3rem', border: '1px solid #B49D85', background: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <svg width="120" height="60" viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
              <g transform="translate(360,40)">
                <polygon points="0,30 30,0 60,30 30,60" fill="#B49D85" stroke="#88644F" strokeWidth="3"/>
                <polygon points="15,30 30,15 45,30 30,45" fill="#ECE7DA" stroke="#88644F" strokeWidth="2"/>
              </g>
              <text x="50" y="100" fontFamily="Georgia, serif" fontSize="64" fontStyle="italic" fontWeight="bold" fill="#4F2C1F">Admin</text>
            </svg>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ padding: '14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ padding: '14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }}
            />
            {authError && <div style={{ color: '#e74c3c', fontSize: '0.9rem', textAlign: 'center' }}>{authError}</div>}
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
              Login to Dashboard
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#88644F', fontSize: '0.85rem' }}>
            Default access: admin@happystickons.com / admin123
          </p>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.orderStatus === 'new' || o.orderStatus === 'processing').length;

  return (
    <div className="admin-layout">
      <Toaster position="top-right" />
      <aside className="sidebar">
        <h2>Happy Admin</h2>
        <nav>
          <ul>
            <li><a href="#" className={currentView === 'dashboard' ? 'active' : ''} onClick={() => setCurrentView('dashboard')}>📊 Dashboard</a></li>
            <li><a href="#" className={currentView === 'orders' ? 'active' : ''} onClick={() => setCurrentView('orders')}>📦 Orders</a></li>
            <li><a href="#" className={currentView === 'products' ? 'active' : ''} onClick={() => setCurrentView('products')}>🎨 Products</a></li>
            <li><a href="#" className={currentView === 'banners' ? 'active' : ''} onClick={() => setCurrentView('banners')}>🖼️ Banners</a></li>
            <li><a href="#" className={currentView === 'customers' ? 'active' : ''} onClick={() => setCurrentView('customers')}>👥 Customers</a></li>
            <li><a href="#" className={currentView === 'settings' ? 'active' : ''} onClick={() => setCurrentView('settings')}>⚙️ Settings</a></li>
          </ul>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 'auto', padding: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'Georgia, serif', textTransform: 'capitalize' }}>
              {currentView} Panel
            </h1>
            <p style={{ color: '#88644F' }}>Monitor sales, customize magnet variants, and edit banners.</p>
          </div>
          <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', color: 'var(--secondary)', border: '1px solid #eee' }}>
            💼 Happy Stick Ons
          </div>
        </header>

        {currentView === 'dashboard' && (
          <>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-title">Total Revenue (INR Equivalent)</div>
                <div className="metric-value">₹{Math.round(calculateRevenue()).toLocaleString()}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Total Orders</div>
                <div className="metric-value">{orders.length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Pending Fulfillments</div>
                <div className="metric-value" style={{ color: pendingOrders > 0 ? '#e74c3c' : 'var(--primary)' }}>{pendingOrders}</div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>📋 Recent Orders</h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#95a5a6' }}>Loading orders...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Shipping Address</th>
                        <th>Date</th>
                        <th>Photos & Downloads</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map(order => (
                        <tr key={order._id}>
                          <td style={{ fontFamily: 'monospace', color: '#95a5a6' }}>#{order._id.slice(-6).toUpperCase()}</td>
                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{order.customerName}</div>
                            <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '4px' }}>{order.email}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.9rem', color: '#2c3e50', maxWidth: '200px', wordBreak: 'break-word' }}>{order.address || 'N/A'}</div>
                          </td>
                          <td style={{ color: 'var(--text-dark)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: '#f4f4f4', padding: '4px', borderRadius: '6px' }}>
                                <img src={item.photoUrl} alt="crop" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                <button 
                                  onClick={() => downloadBase64Image(item.photoUrl, `order-${order._id.slice(-6)}-item-${idx}.jpg`)}
                                  style={{ fontSize: '0.65rem', border: 'none', background: 'var(--primary)', color: '#fff', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  ⬇️ Save
                                </button>
                              </div>
                            ))}
                          </td>
                          <td style={{ fontWeight: '600', color: '#27ae60' }}>{formatOrderPrice(order.totalAmount, order.currency)}</td>
                          <td>
                            <span className={`status-badge status-${order.orderStatus}`}>
                              {order.orderStatus.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={order.orderStatus}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #bdc3c7', background: '#fff', cursor: 'pointer', outline: 'none', fontWeight: 'bold' }}
                            >
                              <option value="new">New</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '5rem', color: '#95a5a6' }}>No orders found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {currentView === 'orders' && (
          <div className="card">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>📋 Manage Orders ({orders.length})</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#95a5a6' }}>Loading orders...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Shipping Address</th>
                      <th>Date</th>
                      <th>Items Details</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td style={{ fontFamily: 'monospace', color: '#95a5a6' }}>#{order._id.slice(-6).toUpperCase()}</td>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{order.customerName}</div>
                          <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '4px' }}>{order.email}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.9rem', color: '#2c3e50', maxWidth: '200px', wordBreak: 'break-word' }}>{order.address || 'N/A'}</div>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: '#f4f4f4', padding: '6px', borderRadius: '6px', border: '1px solid #eee' }}>
                                <img src={item.photoUrl} alt="crop" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{item.shape} x{item.quantity}</span>
                                <button 
                                  onClick={() => downloadBase64Image(item.photoUrl, `order-${order._id.slice(-6)}-item-${idx}.jpg`)}
                                  style={{ fontSize: '0.65rem', border: 'none', background: 'var(--primary)', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  ⬇️ Save
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontWeight: '600', color: '#27ae60' }}>{formatOrderPrice(order.totalAmount, order.currency)}</td>
                        <td>
                          <span className={`status-badge status-${order.orderStatus}`}>
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #bdc3c7', background: '#fff', cursor: 'pointer', outline: 'none', fontWeight: 'bold' }}
                          >
                            <option value="new">New</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '5rem', color: '#95a5a6' }}>No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentView === 'products' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary)', fontFamily: 'Georgia, serif' }}>🎨 Custom Magnet Products</h2>
              {!showProductForm && (
                <button className="btn-primary" onClick={() => setShowProductForm(true)}>
                  ➕ Add New Product
                </button>
              )}
            </div>

            {showProductForm && (
              <div className="card" style={{ background: '#ECE7DA', marginBottom: '2rem', border: '1px solid var(--accent)' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontFamily: 'Georgia, serif' }}>
                  {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                </h3>
                <form onSubmit={saveProduct} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 'bold' }}>Product Name</label>
                    <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 'bold' }}>Magnet Shape</label>
                    <select value={prodShape} onChange={e => setProdShape(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                      <option value="Square">Square</option>
                      <option value="Round">Round</option>
                      <option value="Polaroid">Polaroid</option>
                      <option value="Heart">Heart</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 'bold' }}>Size Dimension</label>
                    <input type="text" value={prodSize} onChange={e => setProdSize(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 'bold' }}>Base Price (USD)</label>
                    <input type="number" step="0.01" value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                    <input type="checkbox" id="prodActive" checked={prodActive} onChange={e => setProdActive(e.target.checked)} />
                    <label htmlFor="prodActive" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Active on Storefront</label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
                      Save Product
                    </button>
                    <button type="button" onClick={resetProductForm} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Shape</th>
                    <th>Size & Price (USD)</th>
                    <th>Price (INR Equiv)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod._id}>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{prod.name}</td>
                      <td>{prod.shape}</td>
                      <td>
                        {prod.sizeOptions?.map((opt, idx) => (
                          <div key={idx}>{opt.size}: ${opt.price.toFixed(2)}</div>
                        ))}
                      </td>
                      <td>
                        {prod.sizeOptions?.map((opt, idx) => (
                          <div key={idx}>₹{Math.round(opt.price * usdToInrRate)}</div>
                        ))}
                      </td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                          background: prod.isActive ? '#e8f5e9' : '#ffebee', color: prod.isActive ? '#388e3c' : '#c62828'
                        }}>
                          {prod.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => startEditProduct(prod)} style={{ background: 'var(--secondary)', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px', fontWeight: 'bold' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => prod._id && deleteProduct(prod._id)} style={{ background: '#e74c3c', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#95a5a6' }}>No products found. Add a product to showcase!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'banners' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary)', fontFamily: 'Georgia, serif' }}>🖼️ Homepage Banners</h2>
              {!showBannerForm && (
                <button className="btn-primary" onClick={() => setShowBannerForm(true)}>
                  ➕ Add New Banner
                </button>
              )}
            </div>

            {showBannerForm && (
              <div className="card" style={{ background: '#ECE7DA', marginBottom: '2rem', border: '1px solid var(--accent)' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontFamily: 'Georgia, serif' }}>
                  {editingBanner ? '✏️ Edit Banner' : '➕ Add New Banner'}
                </h3>
                <form onSubmit={saveBanner} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                    <label style={{ fontWeight: 'bold' }}>Banner Title</label>
                    <input type="text" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                    <label style={{ fontWeight: 'bold' }}>Banner Subtitle</label>
                    <textarea value={bannerSubtitle} onChange={e => setBannerSubtitle(e.target.value)} required rows={2} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 'bold' }}>Background Gradient CSS</label>
                    <input type="text" value={bannerBg} onChange={e => setBannerBg(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 'bold' }}>Text Color</label>
                    <input type="color" value={bannerTextCol} onChange={e => setBannerTextCol(e.target.value)} style={{ padding: '3px', width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 'bold' }}>Redirect Link URL</label>
                    <input type="text" value={bannerLink} onChange={e => setBannerLink(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                    <input type="checkbox" id="bannerActive" checked={bannerActive} onChange={e => setBannerActive(e.target.checked)} />
                    <label htmlFor="bannerActive" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Active</label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
                      Save Banner
                    </button>
                    <button type="button" onClick={resetBannerForm} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {banners.map((ban, idx) => (
                <div key={ban._id || idx} style={{ background: ban.bgGradient, color: ban.textColor, padding: '1.5rem', borderRadius: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--glass-border)', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}>
                  <div>
                    <h3 style={{ color: ban.textColor, marginBottom: '0.5rem', fontFamily: 'Georgia, serif', fontSize: '1.4rem' }}>{ban.title}</h3>
                    <p style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: '1.5rem' }}>{ban.subtitle}</p>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      Link: {ban.linkUrl}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {ban.isActive ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => startEditBanner(ban)} style={{ background: '#fff', color: 'var(--primary)', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        Edit
                      </button>
                      <button onClick={() => ban._id && deleteBanner(ban._id)} style={{ background: '#e74c3c', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: '#95a5a6' }}>No custom banners.</div>
              )}
            </div>
          </div>
        )}

        {currentView === 'customers' && (
          <div className="card">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>👥 Customer Database ({customers.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Account Created</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust, idx) => (
                    <tr key={cust._id || idx}>
                      <td><div style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>{cust.name}</div></td>
                      <td style={{ color: '#7f8c8d' }}>{cust.email}</td>
                      <td style={{ color: '#7f8c8d' }}>{new Date(cust.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: '#95a5a6' }}>No customers registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="card" style={{ maxWidth: '500px' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>⚙️ Global Configurations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>USD to INR Conversion Rate</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>$1 USD = ₹</span>
                  <input 
                    type="number" 
                    value={usdToInrRate} 
                    onChange={e => setUsdToInrRate(Number(e.target.value))} 
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100px', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center' }} 
                  />
                  <span style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>INR</span>
                </div>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => {
                  localStorage.setItem('admin_usd_to_inr', usdToInrRate.toString());
                  toast.success('Conversion rate settings saved successfully!');
                }}
                style={{ alignSelf: 'flex-start', padding: '12px 30px' }}
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
