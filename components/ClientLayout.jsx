'use client';

import { AuthProvider } from '../app/contexts/AuthContext';
import Header from './header';
import Footer from './footer';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="grow">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}