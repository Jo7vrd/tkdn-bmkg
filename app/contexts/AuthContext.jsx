'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Ensure client-only rendering to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user dari localStorage saat mount
  useEffect(() => {
    if (!mounted) return;

    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [mounted]);

  // Login function
  const login = async (email, password) => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Login hanya bisa dilakukan di client side');
      }

      // Call backend API
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login gagal');
      }

      const { token, user: userData } = data;

      // Simpan ke localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      // Simpan ke cookie untuk middleware
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`; // 24 jam
      document.cookie = `role=${userData.role}; path=/; max-age=86400; SameSite=Lax`;

      setUser(userData);

      // Redirect berdasarkan role
      if (userData.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/home');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (formData) => {
    try {
      // Call backend API
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registrasi gagal');
      }

      return { success: true, message: 'Registrasi berhasil! Silakan login.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Hapus cookies
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'role=; path=/; max-age=0; SameSite=Lax';

    setUser(null);
    router.push('/login');
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user,
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
};
