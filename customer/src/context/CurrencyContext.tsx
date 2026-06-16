"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Currency = 'INR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (usdPrice: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('currency');
    if (saved === 'USD' || saved === 'INR') {
      setCurrency(saved);
    }
  }, []);

  const handleSetCurrency = (c: Currency) => {
    setCurrency(c);
    localStorage.setItem('currency', c);
  };

  // USD to INR conversion rate (approximate for mock)
  const USD_TO_INR = 83;

  const formatPrice = (usdPrice: number) => {
    if (!mounted) return `₹${Math.round(usdPrice * USD_TO_INR)}`; // Default SSR
    if (currency === 'INR') {
      return `₹${Math.round(usdPrice * USD_TO_INR)}`;
    }
    return `$${usdPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
