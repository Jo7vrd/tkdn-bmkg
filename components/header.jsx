'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Info, FileText, History } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/evaluate', label: 'Evaluasi', icon: Calculator },
    { href: '/dashboard', label: 'Dashboard', icon: FileText },
    { href: '/history', label: 'Riwayat', icon: History },
    { href: '/info', label: 'Informasi', icon: Info },
  ];

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Jika scroll ke atas atau di posisi paling atas, tampilkan header
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Jika scroll ke bawah dan sudah melewati 10px, sembunyikan header
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlHeader);

    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  // Don't show header on login/register pages
  if (pathname === '/login' || pathname === '/register') {
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
          <Link href="/" className="flex items-center space-x-3 shrink-0">
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

          {/* Navigation */}
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
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}