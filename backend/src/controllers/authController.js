// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// REGISTER
export const register = async (req, res) => {
  try {
    const {
      username, email, password, full_name, nip, 
      phone, unit_kerja, jabatan, ppk_name
    } = req.body;

    // 1. Validasi input
    if (!username || !email || !password || !full_name || !nip) {
      return res.status(400).json({ 
        success: false, 
        message: 'Semua field wajib diisi' 
      });
    }

    // 2. Validasi email BMKG
    if (!email.endsWith('@bmkg.go.id')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email harus menggunakan domain @bmkg.go.id' 
      });
    }

    // 3. Validasi password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password minimal 6 karakter' 
      });
    }

    // 4. Cek apakah email/username sudah terdaftar
    const checkUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email atau username sudah terdaftar' 
      });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Insert ke database
    const result = await pool.query(
      `INSERT INTO users 
      (username, email, password, full_name, nip, phone, unit_kerja, jabatan, ppk_name) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id, username, email, full_name, role`,
      [username, email, hashedPassword, full_name, nip, phone, unit_kerja, jabatan, ppk_name]
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server',
      error: error.message 
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email dan password wajib diisi' 
      });
    }

    // 2. Cari user berdasarkan email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password salah' 
      });
    }

    const user = result.rows[0];

    // 3. Cek apakah akun aktif
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Akun Anda tidak aktif. Hubungi admin.' 
      });
    }

    // 4. Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password salah' 
      });
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '24h' }
    );

    // 6. Hapus password dari response
    delete user.password;

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server',
      error: error.message 
    });
  }
};

// GET USER PROFILE (bonus untuk protected route)
export const getProfile = async (req, res) => {
  try {
    // req.user sudah di-set oleh middleware
    const result = await pool.query(
      'SELECT id, username, email, full_name, nip, phone, unit_kerja, jabatan, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};