-- UUID extension (for user ID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Shoes Table
CREATE TABLE IF NOT EXISTS shoes (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    release_date TIMESTAMP NOT NULL,
    image_url TEXT,
    shop_link TEXT,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shoe_id INTEGER REFERENCES shoes(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, shoe_id)
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shoe_id INTEGER REFERENCES shoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, shoe_id)
);

--ПОЧАТКОВІ ДАНІ
INSERT INTO brands (name) VALUES 
('Adidas'),
('Alexander McQueen'),
('Asics'),
('Balenciaga'),
('Converse'),
('Jordan'),
('New Balance'),
('Nike'),
('Off-White'),
('Puma'),
('Reebok'),
('Salomon'),
('Vans'),
('Yeezy')
ON CONFLICT (name) DO NOTHING;


INSERT INTO categories (name) VALUES 
('Basketball'),
('Collaboration'),
('High-top'),
('Lifestyle'),
('Limited Edition'),
('Luxury'),
('Outdoor/Trail'),
('Performance'),
('Retro'),
('Running'),
('Skateboarding'),
('Vintage')
ON CONFLICT (name) DO NOTHING;