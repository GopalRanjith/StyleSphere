-- StyleSphere Normalized Database Schema (MySQL 8.0+)
-- Design Model: 3NF (Third Normal Form)

CREATE DATABASE IF NOT EXISTS stylesphere_db;
USE stylesphere_db;

-- -------------------------------------------------------------
-- DROP TABLES (Reverse order of foreign keys)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS behavioral_events;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS sizes;
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- -------------------------------------------------------------
-- CREATE TABLES
-- -------------------------------------------------------------

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Themes Table
CREATE TABLE themes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Sizes Table
CREATE TABLE sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    size_name VARCHAR(10) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Products Table (Referencing Categories and Themes)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gender ENUM('men', 'women') NOT NULL,
    category_id INT NOT NULL,
    theme_id INT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    discount INT DEFAULT 0,
    image VARCHAR(255) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    reviews INT DEFAULT 0,
    description TEXT NULL,
    details TEXT NULL,
    materials VARCHAR(255) NULL,
    care VARCHAR(255) NULL,
    ai_insight TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL,
    INDEX idx_product_gender (gender),
    INDEX idx_product_category (category_id),
    INDEX idx_product_theme (theme_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Product Sizes Junction Table (Many-to-Many relationship)
CREATE TABLE product_sizes (
    product_id INT NOT NULL,
    size_id INT NOT NULL,
    PRIMARY KEY (product_id, size_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE RESTRICT,
    INDEX idx_ps_size (size_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_user (user_id),
    INDEX idx_order_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    size_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- price snapshot at purchase time
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE RESTRICT,
    INDEX idx_oi_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Cart Items Table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    size_id INT NOT NULL,
    quantity INT DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_user_prod_size (user_id, product_id, size_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Behavioral Events Table (AI Recommendations Log)
CREATE TABLE behavioral_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    event_type ENUM('view', 'add_to_cart', 'remove_from_cart', 'purchase', 'filter_change') NOT NULL,
    product_id INT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_be_user (user_id),
    INDEX idx_be_event (event_type),
    INDEX idx_be_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- SEED DATA POPULATION
-- -------------------------------------------------------------

-- Populate default test user
-- Password corresponds to bcrypt hash of 'password123'
INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES
(1, 'user@stylesphere.com', '$2a$10$nWC0d252p50yJY4aLNPwheOBVJDt9PTomKMwpvUsxcQlQ.RlX74c.', 'Demo', 'User'),
(2, 'ranjith@stylesphere.com', '$2a$10$nWC0d252p50yJY4aLNPwheOBVJDt9PTomKMwpvUsxcQlQ.RlX74c.', 'Ranjith', 'Gopalakrishnan'),
(3, 'priya.sharma@stylesphere.com', '$2a$10$nWC0d252p50yJY4aLNPwheOBVJDt9PTomKMwpvUsxcQlQ.RlX74c.', 'Priya', 'Sharma'),
(4, 'arjun.mehta@stylesphere.com', '$2a$10$nWC0d252p50yJY4aLNPwheOBVJDt9PTomKMwpvUsxcQlQ.RlX74c.', 'Arjun', 'Mehta');

-- Populate categories
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

-- Populate themes
INSERT INTO themes (id, name) VALUES
(1, 'Marvel'),
(2, 'Anime'),
(3, 'DC'),
(4, 'Harry Potter');

-- Populate sizes lookup
INSERT INTO sizes (id, size_name) VALUES
(1, 'XS'),
(2, 'S'),
(3, 'M'),
(4, 'L'),
(5, 'XL');

-- Populate products (mapping all 14 mock products)
INSERT INTO products (id, name, gender, category_id, theme_id, price, original_price, discount, image, rating, reviews, description, details, materials, care, ai_insight) VALUES
(
    1, 
    'Men Linen Solid Red Shirt', 
    'men', 
    1, -- Linen
    NULL, 
    1499.00, 
    2199.00, 
    31, 
    '/images/red_tshirt.png', 
    4.7, 
    128, 
    'Premium linen-blend solid red shirt with curved hem, spread collar, and full sleeves. Perfect for your casual outings and holiday styling.',
    'Breathable fabric, chest pocket, premium streetwear fit.',
    '55% Linen, 45% Cotton',
    'Gentle machine wash cold',
    'Match it with dark beige chinos and white clean sneakers for a refined summer holiday aesthetic.'
),
(
    2, 
    'Women Puff-Sleeve White Dress', 
    'women', 
    2, -- Cotton
    NULL, 
    1999.00, 
    2999.00, 
    33, 
    '/images/cotton_dress.png', 
    4.8, 
    92, 
    'Beautiful puff-sleeve solid white dress in organic cotton. A-line shape with a square neck front and delicate smocking detail at the back.',
    'Smocked back, soft inner lining, elastic puff sleeves.',
    '100% Organic Cotton',
    'Wash inside out with similar colors',
    'Highly recommended for casual brunch. Style it with block heels and a small pastel shoulder bag.'
),
(
    3, 
    'Women Emerald Satin Slip Dress', 
    'women', 
    3, -- Satin
    NULL, 
    1799.00, 
    2699.00, 
    33, 
    '/images/slip_dress.png', 
    4.9, 
    154, 
    'Ankle-length cocktail slip dress in premium emerald green satin. V-neck cut with adjustable cross shoulder straps and a flattering side leg-slit.',
    'Adjustable back straps, cowl neck, side leg-slit.',
    '95% Polyester, 5% Elastane',
    'Dry clean recommended',
    'An absolute head-turner. Layer with a black leather jacket to add a modern street-style edge.'
),
(
    4, 
    'Men Knitted Rust Polo Shirt', 
    'men', 
    4, -- Knitwear
    NULL, 
    1299.00, 
    1999.00, 
    35, 
    '/images/knit_dress.png', 
    4.6, 
    70, 
    'Textured rib-knit polo shirt in a warm rust brown shade. Designed with a clean zip placket, classic collar, and tapered fit.',
    'Zip collar placket, ribbed cuff and hem, heavy knit construction.',
    '70% Viscose, 30% Polyamide',
    'Flat dry, do not wring, machine wash delicate',
    'Excellent for smart-casual wear. Looks sharp tucked into tailored charcoal trousers.'
),
(
    5, 
    'Marvel: Iron Man Oversized T-Shirt', 
    'men', 
    5, -- Oversized T-Shirts
    1, -- Marvel
    999.00, 
    1499.00, 
    33, 
    '/images/men_marvel_tshirt.png', 
    4.9, 
    312, 
    'Premium heavy-weight oversized red streetwear t-shirt. Features a bold gold metallic Iron Man Arc Reactor print on the front and custom graphic on the back.',
    '240 GSM organic cotton, drop shoulder fit, high-density print.',
    '100% Organic Cotton',
    'Cold wash inside out, iron on reverse',
    'Pair with black cargo joggers and chunky sneakers for an effortless urban streetwear look.'
),
(
    6, 
    'Anime: Naruto Akatsuki Hoodie', 
    'men', 
    8, -- Hoodies
    2, -- Anime
    1999.00, 
    2999.00, 
    33, 
    '/images/men_anime_hoodie.png', 
    4.8, 
    245, 
    'Official merchandise anime hoodie in solid black. Accented with the iconic embroidered red Akatsuki cloud on the center chest and sleeve branding.',
    'Heavy fleece lined, double-layered hood, kangaroo pockets.',
    '80% Cotton, 20% Polyester Fleece',
    'Machine wash cold, tumble dry low',
    'Perfect for fans. Wear with distressed dark denim and high-top sneakers.'
),
(
    7, 
    'DC: Batman Dark Knight Classic Tee', 
    'men', 
    6, -- Classic Fit T-Shirts
    3, -- DC
    799.00, 
    1199.00, 
    33, 
    '/images/red_tshirt.png', 
    4.5, 
    88, 
    'A dark charcoal-grey classic crewneck t-shirt featuring the distressed yellow vintage Batman logo. Soft-washed for an authentic retro feel.',
    'Standard crewneck, breathable knit, vintage screenprint.',
    '100% Combed Cotton',
    'Standard machine wash',
    'Wear it under a black flannel shirt with beige chinos for a grunge-inspired casual style.'
),
(
    8, 
    'Men Premium Olive Cargo Pants', 
    'men', 
    7, -- Cargo Pants
    NULL, 
    1799.00, 
    2499.00, 
    28, 
    '/images/men_cargo_pants.png', 
    4.7, 
    190, 
    'Functional and stylish cargo pants in premium olive green ripstop cotton. Equipped with standard side pockets, deep cargo utility compartments, and elastic drawstrings.',
    'Multiple pockets, adjustable ankle cuffs, relaxed utility fit.',
    '98% Cotton, 2% Elastane',
    'Wash with dark colors, medium iron',
    'An absolute staple. Combines incredibly well with oversized graphic tees or solid knitted polo shirts.'
),
(
    9, 
    'Anime: Jujutsu Kaisen Co-ords', 
    'men', 
    9, -- Co-ords
    2, -- Anime
    2299.00, 
    3199.00, 
    28, 
    '/images/men_coords_set.png', 
    4.9, 
    115, 
    'Modern coordinate street set containing a relaxed half-sleeve shirt and matching elastic waist shorts. Featuring custom minimalist curse seal prints.',
    'Two-piece matching set, notch collar, lightweight breathable weave.',
    '100% Rayon Viscose',
    'Hand wash or delicate machine wash cold',
    'The ultimate beach or summer street style. Keep it simple with slides or clean white slip-ons.'
),
(
    10, 
    'Harry Potter: Gryffindor Knitwear Polo', 
    'men', 
    4, -- Knitwear
    4, -- Harry Potter
    1399.00, 
    1999.00, 
    30, 
    '/images/knit_dress.png', 
    4.6, 
    62, 
    'Classy knitted polo shirt in burgundy with gold collar tipping. Features a small embroidered Gryffindor shield crest on the chest.',
    'Ribbed knit cuffs, two-button placket, retro knit structure.',
    '65% Viscose, 35% Nylon',
    'Dry flat, reshape while wet',
    'Smart-casual at its best. Styles easily with cream tailored trousers and loafers.'
),
(
    11, 
    'Women Marvel Black Widow Tee', 
    'women', 
    6, -- Classic Fit T-Shirts
    1, -- Marvel
    899.00, 
    1299.00, 
    30, 
    '/images/slip_dress.png', 
    4.7, 
    78, 
    'Slim-fit black cotton t-shirt highlighting the red hourglass emblem of Black Widow in a minimalist chrome finish.',
    'Soft-touch cotton, stretch rib collar, premium emblem finish.',
    '95% Cotton, 5% Lycra',
    'Do not iron print directly, wash inside out',
    'Tuck it into a high-waisted black leather skirt and boots for a sleek, edgy ensemble.'
),
(
    12, 
    'Women Anime Sailor Moon Co-ords', 
    'women', 
    9, -- Co-ords
    2, -- Anime
    2199.00, 
    2999.00, 
    26, 
    '/images/cotton_dress.png', 
    4.8, 
    104, 
    'Dreamy co-ord set featuring a pastel pink cropped hoodie and matching high-waisted sweat shorts with Sailor Moon crescent emblems.',
    'Cropped hoodie, drawcord waistband, gold emblem embroidery.',
    '85% Cotton, 15% Polyester',
    'Gentle cycle wash cold',
    'Cute and comfortable lounge style. Matches perfectly with pastel sneakers.'
),
(
    13, 
    'Women Harry Potter Hogwarts Hoodie', 
    'women', 
    8, -- Hoodies
    4, -- Harry Potter
    1899.00, 
    2699.00, 
    29, 
    '/images/wrap_dress.png', 
    4.7, 
    130, 
    'Oversized cozy hoodie in heather gray. Highlights a large distressed vintage Hogwarts crest print across the chest.',
    'Drop shoulder, brushed fleece lining, rib-knit trims.',
    '70% Cotton, 30% Polyester',
    'Standard machine wash with like colors',
    'The perfect casual piece. Wear it with black leggings and boots for a cozy library day look.'
),
(
    14, 
    'Men Cotton Summer Indigo Shirt', 
    'men', 
    2, -- Cotton
    NULL, 
    1199.00, 
    1799.00, 
    33, 
    '/images/red_tshirt.png', 
    4.4, 
    55, 
    'Breathable pure cotton casual shirt dyed in rich indigo wash. Features a neat spread collar, chest pocket, and rolled sleeve tabs.',
    'Lightweight indigo-dyed cotton, standard fit, chest pocket.',
    '100% Cotton',
    'Indigo bleed warning: wash separately first',
    'Wear it open over a white tank top with khaki shorts for the ultimate casual summer weekend outfit.'
);

-- Map sizes to products (product_sizes table)
-- Sizes ID: 1=XS, 2=S, 3=M, 4=L, 5=XL
INSERT INTO product_sizes (product_id, size_id) VALUES
-- Product 1: S, M, L, XL
(1, 2), (1, 3), (1, 4), (1, 5),
-- Product 2: XS, S, M, L
(2, 1), (2, 2), (2, 3), (2, 4),
-- Product 3: S, M, L
(3, 2), (3, 3), (3, 4),
-- Product 4: S, M, L, XL
(4, 2), (4, 3), (4, 4), (4, 5),
-- Product 5: S, M, L, XL
(5, 2), (5, 3), (5, 4), (5, 5),
-- Product 6: S, M, L, XL
(6, 2), (6, 3), (6, 4), (6, 5),
-- Product 7: S, M, L, XL
(7, 2), (7, 3), (7, 4), (7, 5),
-- Product 8: S, M, L, XL
(8, 2), (8, 3), (8, 4), (8, 5),
-- Product 9: M, L, XL
(9, 3), (9, 4), (9, 5),
-- Product 10: S, M, L
(10, 2), (10, 3), (10, 4),
-- Product 11: XS, S, M, L
(11, 1), (11, 2), (11, 3), (11, 4),
-- Product 12: XS, S, M
(12, 1), (12, 2), (12, 3),
-- Product 13: S, M, L
(13, 2), (13, 3), (13, 4),
-- Product 14: S, M, L, XL
(14, 2), (14, 3), (14, 4), (14, 5);
