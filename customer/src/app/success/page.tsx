import Link from 'next/link';

export default function Success() {
  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
      <div className="glass-card">
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ marginBottom: '1rem', color: '#4ECDC4' }}>Order Successful!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Thank you for your order! Your custom fridge magnet is being processed. 
          We'll send you an email with shipping details soon.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
