-- ==========================================================
-- Football Boots Store Database Schema
-- Compatible with MySQL and phpMyAdmin
-- ==========================================================

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `model` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `color` VARCHAR(100) NOT NULL,
  `size` VARCHAR(50) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `image_url` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Football Boots Data
INSERT INTO `products` (`id`, `name`, `brand`, `model`, `price`, `color`, `size`, `stock`, `category`, `description`, `image_url`) VALUES
(1, 'Nike Mercurial Vapor 16 Elite', 'Nike', 'Vapor 16 Elite FG', 8900.00, 'Volt / Black', '42 EU / 8.5 US', 15, 'FG Football Boots', 'รองเท้าสตั๊ดสายความเร็วระดับท็อป น้ำหนักเบาพร้อมเทคโนโลยี Air Zoom 3/4 ตอบสนองการสปีดและเปลี่ยนทิศทางอย่างรวดเร็ว', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80'),
(2, 'Adidas Predator Elite FT', 'Adidas', 'Predator Elite FT FG', 9500.00, 'Core Black / Solar Red', '41.5 EU / 8 US', 10, 'FG Football Boots', 'รองเท้าสายคอนโทรลระดับตำนาน ลิ้นพับสุดคลาสสิก พร้อมยาง Strikeskin ยิงลูกฟุตบอลได้แม่นยำและปั่นโค้งได้อย่างใจ', 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80'),
(3, 'Mizuno Morelia Neo IV Beta Japan', 'Mizuno', 'Neo IV Beta FG', 9200.00, 'White / Gold', '42 EU / 8.5 US', 8, 'FG Football Boots', 'ผลิตในประเทศญี่ปุ่น หนังจิงโจ้เกรดพรีเมียม สัมผัสนุ่มสบายเท้า ทนทาน และน้ำหนักเบาเป็นพิเศษ', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'),
(4, 'Puma Future 7 Ultimate', 'Puma', 'Future 7 Ultimate AG', 7800.00, 'Pink / Black', '42.5 EU / 9 US', 12, 'AG Football Boots', 'รองเท้าสายคล่องตัว สวมใส่สบายด้วยเทคโนโลยีผ้าถัก FUZIONFIT360 และแถบ PWRTAPE กระชับเท้า สำหรับสนามหญ้าเทียม', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'),
(5, 'Nike Phantom GX II Pro TF', 'Nike', 'Phantom GX II Pro TF', 4600.00, 'Black / Chrome', '41 EU / 7.5 US', 20, 'TF Football Boots', 'รองเท้าฟุตบอลร้อยปุ่มสำหรับสนามหญ้าเทียม พื้นยางยึดเกาะดีเยี่ยม อัปเปอร์ NikeSkin นุ่มเท้า คล่องตัว', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80');

