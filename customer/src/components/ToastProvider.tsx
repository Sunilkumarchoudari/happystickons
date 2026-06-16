"use client";
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <div style={{ position: 'relative', zIndex: 99999 }}>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { 
            background: '#4F2C1F', 
            color: '#ECE7DA',
            fontWeight: 'bold',
            borderRadius: '10px'
          },
          success: {
            iconTheme: { primary: '#B49D85', secondary: '#4F2C1F' }
          }
        }} 
      />
    </div>
  );
}
