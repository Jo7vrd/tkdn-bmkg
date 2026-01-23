'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Info, FileText, History, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../app/contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items berdasarkan role
  const getNavItems = () => {
    if (!isAuthenticated) return [];

    if (user?.role === 'admin') {
      return [
        { href: '/admin', label: 'Dashboard Admin', icon: LayoutDashboard },
        { href: '/info', label: 'Informasi', icon: Info },
      ];
    }

    // User role
    return [
      { href: '/home', label: 'Beranda', icon: Home },
      { href: '/evaluate', label: 'Evaluasi', icon: Calculator },
      { href: '/dashboard', label: 'Dashboard', icon: FileText },
      { href: '/history', label: 'Riwayat', icon: History },
      { href: '/info', label: 'Informasi', icon: Info },
    ];
  };

  const navItems = getNavItems();

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  // Don't show header on login/register pages
  if (pathname === '/login' || pathname === '/register' || !isAuthenticated) {
    return null;
  }

  return (
    <header 
      className={`fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={user?.role === 'admin' ? '/admin' : '/home'} className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-indigo-700 shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg gradient-text leading-none">
                TKDN
              </span>
              <span className="text-xs text-gray-500 leading-none mt-0.5">
                Evaluator
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all ml-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Logout */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* User Info Badge - Moved to not block menu */}
      {user && (
        <div className="hidden md:block fixed left-4 top-20 bg-white border rounded-lg shadow-lg px-4 py-2 z-40 pointer-events-none">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="font-semibold text-gray-900">{user.full_name || user.username}</p>
          <p className="text-xs text-blue-600 capitalize">{user.role}</p>
        </div>
      )}
    </header>
  );
}