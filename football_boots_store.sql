-- =====================================================================
-- Database SQL Script สำหรับ: ร้านรองเท้าสตั๊ด (Football Boots Store)
-- Database Name: ip_std6730251280
-- Server: localhost (119.59.102.161 / nindamdb)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table: brands (ตารางแบรนด์ / ยี่ห้อรองเท้าสตั๊ด)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `product_sizes`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `brands`;
DROP TABLE IF EXISTS `customers`;

CREATE TABLE `brands` (
  `brand_id` INT AUTO_INCREMENT PRIMARY KEY,
  `brand_name` VARCHAR(100) NOT NULL COMMENT 'ชื่อแบรนด์ เช่น Nike, Adidas, Puma, Mizuno',
  `country` VARCHAR(50) DEFAULT NULL COMMENT 'ประเทศต้นกำเนิด',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Table: categories (ตารางประเภทปุ่มสตั๊ด / พื้นสนาม)
-- ---------------------------------------------------------------------
CREATE TABLE `categories` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL COMMENT 'ชื่อประเภท เช่น Firm Ground (หญ้าจริง), Turf (ร้อยปุ่มหญ้าเทียม)',
  `stud_type` VARCHAR(20) NOT NULL COMMENT 'ประเภทปุ่มย่อ เช่น FG, AG, SG, TF, IC',
  `description` TEXT DEFAULT NULL COMMENT 'คำอธิบายคุณสมบัติและสนามที่เหมาะสม',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Table: products (ตารางสินค้า / รองเท้าสตั๊ด)
-- ---------------------------------------------------------------------
CREATE TABLE `products` (
  `product_id` INT AUTO_INCREMENT PRIMARY KEY,
  `brand_id` INT NOT NULL COMMENT 'รหัสแบรนด์ (เชื่อมโยง brands.brand_id)',
  `category_id` INT NOT NULL COMMENT 'รหัสประเภทปุ่ม (เชื่อมโยง categories.category_id)',
  `product_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสสินค้า SKU เช่น NK-MERC-001',
  `name` VARCHAR(150) NOT NULL COMMENT 'ชื่อรุ่นรองเท้าสตั๊ด',
  `tier_level` VARCHAR(50) DEFAULT 'Elite / Top' COMMENT 'เกรดรองเท้า เช่น Elite, Pro, Academy, Club',
  `upper_material` VARCHAR(100) DEFAULT 'Flyknit / Synthetic' COMMENT 'วัสดุอัปเปอร์ เช่น หนังแท้, หนังสังเคราะห์, ผ้าถัก',
  `colorway` VARCHAR(100) DEFAULT NULL COMMENT 'สีรองเท้า',
  `price` DECIMAL(10, 2) NOT NULL COMMENT 'ราคาขาย',
  `stock` INT NOT NULL DEFAULT 0 COMMENT 'สต็อกรวมทั้งหมด',
  `location` VARCHAR(100) DEFAULT 'Main Warehouse' COMMENT 'ที่จัดเก็บ / สาขา',
  `status` ENUM('Active', 'Inactive', 'Out of Stock') DEFAULT 'Active' COMMENT 'สถานะการจำหน่าย',
  `image` VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อไฟล์รูปภาพหรือ URL',
  `description` TEXT DEFAULT NULL COMMENT 'รายละเอียดสินค้า',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`brand_id`),
  INDEX (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Table: product_sizes (ตารางไซส์และสต็อกสินค้าในแต่ละไซส์)
-- ---------------------------------------------------------------------
CREATE TABLE `product_sizes` (
  `size_id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL COMMENT 'เชื่อมโยง products.product_id',
  `size_eu` DECIMAL(3, 1) NOT NULL COMMENT 'ไซส์ EU เช่น 40.0, 41.0, 42.0',
  `size_us` DECIMAL(3, 1) DEFAULT NULL COMMENT 'ไซส์ US',
  `size_cm` DECIMAL(4, 1) DEFAULT NULL COMMENT 'ความยาวเท้า (CM)',
  `stock` INT NOT NULL DEFAULT 0 COMMENT 'จำนวนสต็อกในไซส์นี้',
  INDEX (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Table: customers (ตารางข้อมูลลูกค้า)
-- ---------------------------------------------------------------------
CREATE TABLE `customers` (
  `customer_id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL COMMENT 'ชื่อจริง',
  `last_name` VARCHAR(100) NOT NULL COMMENT 'นามสกุล',
  `email` VARCHAR(150) NOT NULL UNIQUE COMMENT 'อีเมล',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT 'เบอร์โทรศัพท์',
  `address` TEXT DEFAULT NULL COMMENT 'ที่อยู่จัดส่ง',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Table: orders (ตารางคำสั่งซื้อ)
-- ---------------------------------------------------------------------
CREATE TABLE `orders` (
  `order_id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสคำสั่งซื้อ เช่น ORD-20260918-001',
  `customer_id` INT NOT NULL COMMENT 'เชื่อมโยง customers.customer_id',
  `total_amount` DECIMAL(10, 2) NOT NULL COMMENT 'ยอดรวมชำระ',
  `payment_method` ENUM('PromptPay', 'Credit Card', 'Bank Transfer', 'Cash on Delivery') DEFAULT 'PromptPay' COMMENT 'วิธีชำระเงิน',
  `payment_status` ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending' COMMENT 'สถานะการจ่ายเงิน',
  `order_status` ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending' COMMENT 'สถานะคำสั่งซื้อ',
  `shipping_address` TEXT NOT NULL COMMENT 'ที่อยู่จัดส่งสำหรับออเดอร์นี้',
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Table: order_items (ตารางรายการสินค้าในคำสั่งซื้อ)
-- ---------------------------------------------------------------------
CREATE TABLE `order_items` (
  `item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL COMMENT 'เชื่อมโยง orders.order_id',
  `product_id` INT NOT NULL COMMENT 'เชื่อมโยง products.product_id',
  `size_id` INT NOT NULL COMMENT 'เชื่อมโยง product_sizes.size_id',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT 'จำนวนชิ้น',
  `unit_price` DECIMAL(10, 2) NOT NULL COMMENT 'ราคาต่อหน่วย ณ วันที่สั่งซื้อ',
  `subtotal` DECIMAL(10, 2) NOT NULL COMMENT 'ราคารวมรายการ',
  INDEX (`order_id`),
  INDEX (`product_id`),
  INDEX (`size_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- ข้อมูลจำลองตัวอย่าง (INSERT Mock Data)
-- =====================================================================

-- Brands (แบรนด์ยอดนิยม)
INSERT INTO `brands` (`brand_id`, `brand_name`, `country`) VALUES
(1, 'Nike', 'USA'),
(2, 'Adidas', 'Germany'),
(3, 'Puma', 'Germany'),
(4, 'Mizuno', 'Japan');

-- Categories (ประเภทปุ่มสนาม)
INSERT INTO `categories` (`category_id`, `category_name`, `stud_type`, `description`) VALUES
(1, 'Firm Ground (สนามหญ้าจริงทั่วไป)', 'FG', 'ปุ่มมาตรฐานสำหรับสนามหญ้าจริงที่มีความชื้นปานกลาง ไม่แฉะหรือแข็งเกินไป'),
(2, 'Artificial Grass (สนามหญ้าเทียม)', 'AG', 'ปุ่มสั้นและกลมมน กระจายน้ำหนักได้ดี ลดแรงกระแทกบนสนามหญ้าเทียม'),
(3, 'Turf (สนามหญ้าเทียมร้อยปุ่ม)', 'TF', 'พื้นปุ่มยางสั้นจำนวนมาก เหมาะสำหรับสนามหญ้าเทียมขนสั้นหรือออกกำลังกายทั่วไป'),
(4, 'Soft Ground (สนามหญ้าเปียกแฉะ)', 'SG', 'ปุ่มโลหะผสม สำหรับสนามนุ่ม เปียกชื้น ฝนตก ดินแฉะ');

-- Products (รองเท้าสตั๊ดรุ่นยอดนิยม)
INSERT INTO `products` (`product_id`, `brand_id`, `category_id`, `product_code`, `name`, `tier_level`, `upper_material`, `colorway`, `price`, `stock`, `location`, `status`, `image`, `description`) VALUES
(1, 1, 1, 'NK-MERC-001', 'Nike Air Zoom Mercurial Vapor 16 Elite FG', 'Elite / Top', 'Gripknit', 'Volt / Black', 8900.00, 15, 'Store 1', 'Active', 'nike_vapor_16.jpg', 'รองเท้าสายความเร็วระดับท็อป น้ำหนักเบาพร้อมเทคโนโลยี Air Zoom ตอบสนองการสปีด'),
(2, 2, 1, 'AD-PRED-002', 'Adidas Predator Elite FT FG', 'Elite / Top', 'HybridTouch 2.0 + Strikeskin', 'Core Black / Solar Red', 9500.00, 10, 'Store 1', 'Active', 'adidas_predator_ft.jpg', 'รองเท้าสายควบคุมพร้อมลิ้นพับสุดคลาสสิก ยาง Strikeskin ยิงบอลแม่นยำและปั่นโค้งได้ดี'),
(3, 4, 1, 'MZ-MORE-003', 'Mizuno Morelia Neo IV Beta Japan FG', 'Japan / Top', 'Kangaroo Leather', 'White / Gold', 9200.00, 8, 'Store 2', 'Active', 'mizuno_neo4_beta.jpg', 'รองเท้าหนังจิงโจ้แท้เกรดพรีเมียมผลิตในประเทศญี่ปุ่น สัมผัสนุ่มสบายเท้า ทนทานยอดเยี่ยม'),
(4, 3, 2, 'PM-FUTR-004', 'Puma Future 7 Ultimate AG', 'Elite / Top', 'FUZIONFIT360 + PWRTAPE', 'Pink / Black', 7800.00, 12, 'Store 3', 'Active', 'puma_future7.jpg', 'รองเท้าสายคล่องตัว สวมใส่สบายด้วยเทคโนโลยีผ้าถักกระชับเท้า เหมาะกับหญ้าเทียม'),
(5, 1, 3, 'NK-PHAN-005', 'Nike Phantom GX II Pro TF', 'Pro', 'NikeSkin', 'Black / Chrome', 4600.00, 20, 'Store 2', 'Active', 'nike_phantom_tf.jpg', 'ร้อยปุ่มสำหรับสนามหญ้าเทียม ยึดเกาะดีเยี่ยม นุ่มเท้า ลดอาการบาดเจ็บ');

-- Product Sizes (ไซส์และสต็อกแต่ละคู่)
INSERT INTO `product_sizes` (`product_id`, `size_eu`, `size_us`, `size_cm`, `stock`) VALUES
(1, 40.0, 7.0, 25.0, 3),
(1, 41.0, 8.0, 26.0, 5),
(1, 42.0, 8.5, 26.5, 4),
(1, 43.0, 9.5, 27.5, 3),
(2, 41.0, 8.0, 26.0, 2),
(2, 42.0, 8.5, 26.5, 5),
(2, 42.5, 9.0, 27.0, 3),
(3, 40.5, 7.5, 26.0, 2),
(3, 41.0, 8.0, 26.5, 3),
(3, 42.0, 8.5, 27.0, 3),
(4, 42.0, 9.0, 27.0, 6),
(4, 43.0, 10.0, 28.0, 6),
(5, 41.0, 8.0, 26.0, 10),
(5, 42.0, 8.5, 26.5, 10);

-- Customers (ลูกค้า)
INSERT INTO `customers` (`customer_id`, `first_name`, `last_name`, `email`, `phone`, `address`) VALUES
(1, 'ธีรดนย์', 'มีทรัพย์', 'theeradon@example.com', '081-234-5678', '99/1 ถ.พหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900'),
(2, 'สมชาย', 'สายบอล', 'somchai@example.com', '089-876-5432', '123 หมู่ 4 ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200');

-- Orders (คำสั่งซื้อ)
INSERT INTO `orders` (`order_id`, `order_code`, `customer_id`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `shipping_address`) VALUES
(1, 'ORD-20260918-001', 1, 8900.00, 'PromptPay', 'Paid', 'Processing', '99/1 ถ.พหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900');

-- Order Items (สินค้าในคำสั่งซื้อ)
INSERT INTO `order_items` (`order_id`, `product_id`, `size_id`, `quantity`, `unit_price`, `subtotal`) VALUES
(1, 1, 3, 1, 8900.00, 8900.00);

