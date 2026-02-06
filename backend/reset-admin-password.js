// Script to reset admin password
import bcrypt from 'bcryptjs';
import pool from './src/config/database.js';

async function resetAdminPassword() {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email',
      [hash, 'admin@bmkg.go.id']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('Email: admin@bmkg.go.id');
      console.log('Password: admin123');
    } else {
      console.log('❌ Admin user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
