"use client";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Load customizer component dynamically with ssr disabled
const CreateMagnet = dynamic(() => import('@/components/CreateMagnetComponent'), {
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>Loading Customizer Workspace...</div>
});

export default function Page() {
  return (
    <Suspense fallback={<div style={{textAlign: 'center', padding: '5rem'}}>Loading workspace...</div>}>
      <CreateMagnet />
    </Suspense>
  );
}
