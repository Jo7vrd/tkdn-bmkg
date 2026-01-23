'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user dari localStorage saat mount
  useEffect(() => {
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
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // TODO: Replace dengan API call yang sebenarnya
      // Simulasi login
      let userData;
      let token;

      if (email === 'admin@bmkg.go.id' && password === 'admin123') {
        userData = {
          id: 1,
          email: 'admin@bmkg.go.id',
          username: 'admin',
          role: 'admin',
          full_name: 'Administrator BMKG'
        };
        token = 'admin-token-12345';
      } else if (email === 'testuser@bmkg.go.id' && password === 'user123') {
        userData = {
          id: 2,
          email: 'testuser@bmkg.go.id',
          username: 'testuser',
          role: 'user',
          full_name: 'Test User BMKG'
        };
        token = 'user-token-67890';
      } else {
        throw new Error('Email atau password salah');
      }

      // Simpan ke localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      // Simpan ke cookie untuk middleware
      document.cookie = `token=${token}; path=/; max-age=86400`; // 24 jam
      document.cookie = `role=${userData.role}; path=/; max-age=86400`;

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
  const register = async () => {
    try {
      // TODO: Replace dengan API call yang sebenarnya
      // Simulasi registrasi
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For future use when connected to backend
      // const userData = {
      //   id: Date.now(),
      //   email: formData.email,
      //   username: formData.username,
      //   role: 'user',
      //   full_name: formData.full_name,
      //   nip: formData.nip,
      //   phone: formData.phone,
      //   unit_kerja: formData.unit_kerja,
      //   jabatan: formData.jabatan
      // };

      return { success: true, message: 'Registrasi berhasil! Silakan login.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Hapus cookies
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    
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
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
};