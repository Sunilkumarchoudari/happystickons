import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import { CurrencyProvider } from "@/context/CurrencyContext";
import ToastProvider from "@/components/ToastProvider";
import { Comfortaa, Quicksand } from "next/font/google";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-comfortaa",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happy Stick Ons | Custom Fridge Magnets",
  description: "Create beautiful custom fridge magnets from your photos. 3D preview and premium glossy finish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${comfortaa.variable} ${quicksand.variable}`}>
        <CurrencyProvider>
          <ToastProvider />
          <div className="ui-layer">
            <Navbar />
            
            <main>
              {children}
            </main>
            
            <footer className="footer">
              <div className="footer-content">
                <div>
                  <h3>🎨 Happy Stick Ons</h3>
                  <p>Turn memories into beautiful fridge magnets.</p>
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '1.1rem', fontWeight: 600, color: '#34495e' }}>
                    <span>🔒 Secure Payment Verified</span>
                    <span>🛡️ 24/7 Dedicated Support</span>
                    <span>🏆 100% Satisfaction Guarantee</span>
                  </div>
                </div>
                <div>
                  <h3>🔗 Quick Links</h3>
                  <Link href="/">🏠 Home</Link>
                  <Link href="/create">✨ Create Magnet</Link>
                  <Link href="/track">📦 Track Order</Link>
                  <Link href="#">❓ FAQ</Link>
                </div>
                <div>
                  <h3>📞 Contact & Follow Us</h3>
                  <p>📧 Email: hello@happystickons.com</p>
                  <p>📱 Phone: +1 234 567 890</p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '2rem' }}>
                    <Link href="#" style={{ textDecoration: 'none' }}>📸</Link>
                    <Link href="#" style={{ textDecoration: 'none' }}>🐦</Link>
                    <Link href="#" style={{ textDecoration: 'none' }}>📘</Link>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Happy Stick Ons. All rights reserved.
              </div>
            </footer>
          </div>
        </CurrencyProvider>
        
        {/* Instagram Embed Script loaded lazily */}
        <Script src="//www.instagram.com/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
