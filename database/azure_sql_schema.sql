-- StyleSphere T-SQL Schema & Seed Script for Azure SQL Database

-- 1. Drop existing tables if they exist
IF OBJECT_ID('behavioral_events', 'U') IS NOT NULL DROP TABLE behavioral_events;
IF OBJECT_ID('cart_items', 'U') IS NOT NULL DROP TABLE cart_items;
IF OBJECT_ID('order_items', 'U') IS NOT NULL DROP TABLE order_items;
IF OBJECT_ID('orders', 'U') IS NOT NULL DROP TABLE orders;
IF OBJECT_ID('product_sizes', 'U') IS NOT NULL DROP TABLE product_sizes;
IF OBJECT_ID('products', 'U') IS NOT NULL DROP TABLE products;
IF OBJECT_ID('sizes', 'U') IS NOT NULL DROP TABLE sizes;
IF OBJECT_ID('themes', 'U') IS NOT NULL DROP TABLE themes;
IF OBJECT_ID('categories', 'U') IS NOT NULL DROP TABLE categories;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;

-- 2. Users Table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
CREATE INDEX idx_user_email ON users(email);

-- 3. Categories Table
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) UNIQUE NOT NULL
);

-- 4. Themes Table
CREATE TABLE themes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) UNIQUE NOT NULL
);

-- 5. Sizes Table
CREATE TABLE sizes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    size_name NVARCHAR(10) UNIQUE NOT NULL
);

-- 6. Products Table
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    gender NVARCHAR(10) NOT NULL CHECK (gender IN ('men', 'women')),
    category_id INT NOT NULL REFERENCES categories(id),
    theme_id INT NULL REFERENCES themes(id),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    discount INT DEFAULT 0,
    image NVARCHAR(500) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.5,
    reviews INT DEFAULT 0,
    description NVARCHAR(MAX) NOT NULL,
    details NVARCHAR(MAX) NULL,
    materials NVARCHAR(MAX) NULL,
    care NVARCHAR(MAX) NULL,
    ai_insight NVARCHAR(MAX) NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 7. Product Sizes Bridge Table
CREATE TABLE product_sizes (
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_id INT NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, size_id)
);

-- 8. Cart Items Table
CREATE TABLE cart_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_id INT NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- 9. Orders Table
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'Confirmed',
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 10. Order Items Table
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_id INT NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- 11. Behavioral Events Table
CREATE TABLE behavioral_events (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
    event_type NVARCHAR(50) NOT NULL,
    product_id INT NULL REFERENCES products(id) ON DELETE SET NULL,
    metadata NVARCHAR(MAX) NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =============================================================
-- SEED DATA
-- =============================================================

-- Seed Users
SET IDENTITY_INSERT users ON;
INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES
(1, 'user@stylesphere.com', '$2a$10$nWC0d252p50yJY4aLNPwheOBVJDt9PTomKMwpvUsxcQlQ.RlX74c.', 'Demo', 'User'),
(2, 'ranjith@stylesphere.com', '$2a$10$nWC0d252p50yJY4aLNPwheOBVJDt9PTomKMwpvUsxcQlQ.RlX74c.', 'Ranjith', 'Gopalakrishnan'),
(3, 'priya.sharma@stylesphere.com', '$2a$10$nWC0d252p50yJY4aLNPwheOBVJDt9PTomKMwpvUsxcQlQ.RlX74c.', 'Priya', 'Sharma'),
(4, 'arjun.mehta@stylesphere.com', '$2a$10$nWC0d252p50yJY4aLNPwheOBVJDt9PTomKMwpvUsxcQlQ.RlX74c.', 'Arjun', 'Mehta');
SET IDENTITY_INSERT users OFF;

-- Seed Categories
SET IDENTITY_INSERT categories ON;
INSERT INTO categories (id, name) VALUES
(1, 'Linen'),
(2, 'Cotton'),
(3, 'Satin'),
(4, 'Knitwear'),
(5, 'Oversized T-Shirts'),
(6, 'Classic Fit T-Shirts'),
(7, 'Cargo Pants'),
(8, 'Hoodies'),
(9, 'Co-ords');
SET IDENTITY_INSERT categories OFF;

-- Seed Themes
SET IDENTITY_INSERT themes ON;
INSERT INTO themes (id, name) VALUES
(1, 'Marvel'),
(2, 'Anime'),
(3, 'DC'),
(4, 'Harry Potter');
SET IDENTITY_INSERT themes OFF;

-- Seed Sizes
SET IDENTITY_INSERT sizes ON;
INSERT INTO sizes (id, size_name) VALUES
(1, 'XS'),
(2, 'S'),
(3, 'M'),
(4, 'L'),
(5, 'XL');
SET IDENTITY_INSERT sizes OFF;

-- Seed Products
SET IDENTITY_INSERT products ON;
INSERT INTO products (id, name, gender, category_id, theme_id, price, original_price, discount, image, rating, reviews, description, details, materials, care, ai_insight) VALUES
(1, 'Men Linen Solid Red Shirt', 'men', 1, NULL, 1499.00, 2199.00, 31, '/images/red_tshirt.png', 4.7, 128, 'Premium linen-blend solid red shirt with curved hem, spread collar, and full sleeves.', 'Breathable fabric, chest pocket, streetwear fit.', '55% Linen, 45% Cotton', 'Gentle machine wash cold', 'Match it with dark beige chinos and white sneakers.'),
(2, 'Women Cotton Floral Sundress', 'women', 2, NULL, 1299.00, 1899.00, 31, '/images/floral_dress.png', 4.8, 96, 'Lightweight pure cotton sundress with a subtle pastel floral motif.', 'A-line silhouette, square neckline, back zip.', '100% Breathable Cotton', 'Machine wash cold inside out', 'Pair with a straw bucket hat and woven sandals.'),
(3, 'Women Emerald Satin Slip Dress', 'women', 3, NULL, 1799.00, 2699.00, 33, '/images/slip_dress.png', 4.9, 154, 'Ankle-length cocktail slip dress in emerald green satin.', 'Adjustable back straps, cowl neck, side leg-slit.', '95% Polyester, 5% Elastane', 'Dry clean recommended', 'Layer with a black leather jacket for modern streetwear.'),
(4, 'Men Knitted Rust Polo Shirt', 'men', 4, NULL, 1299.00, 1999.00, 35, '/images/knit_dress.png', 4.6, 70, 'Textured rib-knit polo shirt in a warm rust brown shade.', 'Zip collar placket, ribbed cuff and hem.', '100% Cotton Rib-Knit', 'Flat dry only', 'Pair with pleated off-white trousers and loafers.'),
(5, 'Marvel: Spider-Man Web-Slinger Oversized Tee', 'men', 5, 1, 999.00, 1499.00, 33, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', 4.8, 312, 'Official Marvel licensed heavy-gauge 240 GSM drop-shoulder oversized tee.', 'High-density screen print, drop shoulder.', '100% Combed Cotton', 'Machine wash cold inside out', 'Pair with oversized black cargo joggers and chunky high-top sneakers.'),
(6, 'Anime: Naruto Sage Mode Graphic Tee', 'men', 5, 2, 949.00, 1399.00, 32, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80', 4.9, 420, 'Drop-shoulder aesthetic anime tee with vivid Uzumaki Sage Mode graphics.', 'Puff print emblem, acid wash finish.', '100% Ring-Spun Cotton (220 GSM)', 'Gentle wash inside out', 'Style with olive green parachute pants.'),
(7, 'DC: Batman Dark Knight Utility Cargo Pants', 'men', 7, 3, 1999.00, 2799.00, 28, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80', 4.7, 185, 'Stealth black tactical cargo pants with multi-compartment utility pockets.', 'Water-resistant coated twill, adjustable velcro cuffs.', '98% Cotton, 2% Spandex', 'Machine wash cold', 'Pair with an oversized monochrome graphic tee and technical boots.'),
(8, 'Harry Potter: Hogwarts Crest Heavyweight Hoodie', 'men', 8, 4, 2199.00, 3199.00, 31, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80', 4.9, 260, 'Plush 360 GSM fleece hoodie featuring gold metallic embroidery of the Hogwarts crest.', 'Kangaroo pocket, brushed fleece lining, brass drawcord tips.', '80% Cotton, 20% Polyester Fleece', 'Gentle cold wash', 'Layer under a denim trucker jacket with relaxed corduroy trousers.'),
(9, 'Women Marvel: Scarlet Witch Oversized Crop Tee', 'women', 5, 1, 899.00, 1299.00, 30, 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&auto=format&fit=crop&q=80', 4.8, 142, 'Washed crimson crop tee featuring minimalist chaos magic typography.', 'Raw-cut distressed hem, boxy relaxed fit.', '100% Super-Combed Cotton', 'Machine wash cold', 'Pair with high-waisted black wide-leg denims.'),
(10, 'Women Anime: Attack on Titan Scout Co-ord Set', 'women', 9, 2, 2499.00, 3499.00, 28, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', 4.9, 98, 'Signature 2-piece utility co-ord set with cropped military jacket and pleated high-rise skirt.', 'Embroidered Wings of Freedom insignia, custom metallic hardware.', 'Cotton-Poly Twill', 'Dry clean or delicate cycle', 'Wear with combat lace-up boots for an effortless anime runway look.'),
(11, 'Women DC: Wonder Woman Metallic Print Tee', 'women', 6, 3, 799.00, 1199.00, 33, 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop&q=80', 4.7, 85, 'Fitted baby tee in navy blue with foil gold Wonder Woman crest emblem.', 'Ribbed crew collar, soft enzyme wash.', '95% Cotton, 5% Lycra', 'Hand wash cold', 'Pair with a high-waist pleated tennis skirt.'),
(12, 'Women Harry Potter: Ravenclaw Knitted Sweater Vest', 'women', 4, 4, 1399.00, 1999.00, 30, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80', 4.8, 119, 'Vintage preppy cable-knit sweater vest with Ravenclaw midnight-blue and bronze stripes.', 'V-neck, soft acrylic-wool blend, ribbed hem.', '70% Acrylic, 30% Cotton', 'Dry flat', 'Layer over an oversized white button-down shirt with chunky loafers.'),
(13, 'Men Essential Relaxed Fit Washed Black Tee', 'men', 6, NULL, 699.00, 999.00, 30, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80', 4.6, 210, 'Minimalist mineral-washed black crewneck tee for daily luxury rotation.', 'Seamless sides, pre-shrunk cotton.', '100% Organic Ring-Spun Cotton', 'Machine wash cold', 'The ultimate neutral base. Goes with every jacket, flannel, or overshirt in your closet.'),
(14, 'Women Minimalist Ribbed Lavender Co-ord Lounge Set', 'women', 9, NULL, 1899.00, 2699.00, 29, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80', 4.8, 174, 'Ultra-soft waffle-knit 2-piece lounge set with relaxed drop-shoulder top and wide-leg trousers.', 'Elastic drawstring waistband, deep side pockets.', '65% Modal, 30% Polyester, 5% Spandex', 'Delicate machine wash', 'Effortless airport and cafe look. Pair with sleek white slides and an oversized tote bag.');
SET IDENTITY_INSERT products OFF;

-- Seed Product Sizes (S, M, L for all products)
INSERT INTO product_sizes (product_id, size_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 2), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 2), (4, 3), (4, 4), (4, 5),
(5, 2), (5, 3), (5, 4), (5, 5),
(6, 2), (6, 3), (6, 4), (6, 5),
(7, 2), (7, 3), (7, 4),
(8, 2), (8, 3), (8, 4), (8, 5),
(9, 1), (9, 2), (9, 3),
(10, 1), (10, 2), (10, 3), (10, 4),
(11, 1), (11, 2), (11, 3),
(12, 1), (12, 2), (12, 3), (12, 4),
(13, 2), (13, 3), (13, 4), (13, 5),
(14, 1), (14, 2), (14, 3), (14, 4);
