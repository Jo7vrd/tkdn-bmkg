-- Migration: Create users table
-- Run: psql -U jonathanalvarado -d bmkg_p3dn -f 002_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nip VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    unit_kerja VARCHAR(255),
    jabatan VARCHAR(255),
    ppk_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_nip ON users(nip);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, nip, role)
VALUES (
        'admin',
        'admin@bmkg.go.id',
        '$2a$10$xQkYv5K5f0mGx7LYvN5zPe3qVQ0Z9J5YJz5Z5Z5Z5Z5Z5Z5Z5Z5Z5u',
        -- admin123
        'Administrator BMKG',
        '199999999999999999',
        'admin'
    ) ON CONFLICT (email) DO NOTHING;
COMMENT ON TABLE users IS 'Table untuk menyimpan data user sistem TKDN Evaluator';