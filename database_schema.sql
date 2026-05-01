-- =====================================================
-- NADOM Platform - Database Schema
-- Version: 1.0
-- Description: Complete database structure for Import-Export & Personal Shopping platform
-- =====================================================

-- Set charset
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(50) PRIMARY KEY,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `country` VARCHAR(100),
    `city` VARCHAR(100),
    `role` ENUM('client', 'admin', 'agent') NOT NULL DEFAULT 'client',
    `avatar` VARCHAR(500),
    `email_verified` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name_fr` VARCHAR(200) NOT NULL,
    `name_en` VARCHAR(200) NOT NULL,
    `icon` VARCHAR(100) NOT NULL,
    `color` VARCHAR(7) NOT NULL DEFAULT '#3498db',
    `is_active` BOOLEAN DEFAULT TRUE,
    `display_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_active` (`is_active`),
    INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. PRODUCTS TABLE
-- =====================================================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` VARCHAR(50) PRIMARY KEY,
    `category_id` VARCHAR(50) NOT NULL,
    `name_fr` VARCHAR(200) NOT NULL,
    `name_en` VARCHAR(200) NOT NULL,
    `description_fr` TEXT,
    `description_en` TEXT,
    `price` DECIMAL(12, 2) NOT NULL,
    `image` VARCHAR(500),
    `is_active` BOOLEAN DEFAULT TRUE,
    `stock_status` ENUM('in_stock', 'out_of_stock', 'on_demand') DEFAULT 'on_demand',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_category` (`category_id`),
    INDEX `idx_active` (`is_active`),
    INDEX `idx_price` (`price`),
    FULLTEXT INDEX `idx_search` (`name_fr`, `name_en`, `description_fr`, `description_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. DESTINATIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS `destinations`;
CREATE TABLE `destinations` (
    `id` VARCHAR(50) PRIMARY KEY,
    `country` VARCHAR(100) NOT NULL,
    `continent` VARCHAR(50) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `flag` VARCHAR(10),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_country` (`country`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. SHIPPING MODES TABLE
-- =====================================================
DROP TABLE IF EXISTS `shipping_modes`;
CREATE TABLE `shipping_modes` (
    `id` VARCHAR(50) PRIMARY KEY,
    `destination_id` VARCHAR(50) NOT NULL,
    `mode` ENUM('air_normal', 'air_express', 'sea') NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `cost_per_kg` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE CASCADE,
    INDEX `idx_destination` (`destination_id`),
    INDEX `idx_mode` (`mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. SHIPMENTS TABLE
-- =====================================================
DROP TABLE IF EXISTS `shipments`;
CREATE TABLE `shipments` (
    `id` VARCHAR(50) PRIMARY KEY,
    `tracking_number` VARCHAR(100) UNIQUE NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `request_id` VARCHAR(50),
    `destination_country` VARCHAR(100) NOT NULL,
    `destination_city` VARCHAR(100) NOT NULL,
    `shipping_mode` ENUM('air_normal', 'air_express', 'sea') NOT NULL,
    `status` ENUM('pending', 'picked_up', 'in_transit', 'in_customs', 'out_for_delivery', 'delivered') NOT NULL DEFAULT 'pending',
    `weight` DECIMAL(10, 2) NOT NULL,
    `dimensions` VARCHAR(100),
    `declared_value` DECIMAL(12, 2) NOT NULL,
    `shipping_cost` DECIMAL(12, 2) NOT NULL,
    `current_location` VARCHAR(200),
    `estimated_delivery` DATE,
    `actual_delivery` DATE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_tracking` (`tracking_number`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. PERSONAL SHOPPING REQUESTS TABLE
-- =====================================================
DROP TABLE IF EXISTS `personal_shopping_requests`;
CREATE TABLE `personal_shopping_requests` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `contact_number` VARCHAR(20),
    `status` ENUM('pending', 'searching', 'negotiating', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    `category` VARCHAR(200) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,
    `images` JSON,
    `budget_estimated` DECIMAL(12, 2) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `quoted_price` DECIMAL(12, 2),
    `quoted_details` JSON,
    `assigned_agent_id` VARCHAR(50),
    `whatsapp_messages` INT DEFAULT 0,
    `tracking_number` VARCHAR(100),
    `shipment_id` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assigned_agent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE SET NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_agent` (`assigned_agent_id`),
    INDEX `idx_tracking` (`tracking_number`),
    INDEX `idx_created_at` (`created_at`),
    FULLTEXT INDEX `idx_search` (`title`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. REQUEST ITEMS TABLE
-- =====================================================
DROP TABLE IF EXISTS `request_items`;
CREATE TABLE `request_items` (
    `id` VARCHAR(50) PRIMARY KEY,
    `request_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price` DECIMAL(12, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`request_id`) REFERENCES `personal_shopping_requests`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    INDEX `idx_request` (`request_id`),
    INDEX `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. SHIPMENT TIMELINE TABLE
-- =====================================================
DROP TABLE IF EXISTS `shipment_timeline`;
CREATE TABLE `shipment_timeline` (
    `id` VARCHAR(50) PRIMARY KEY,
    `shipment_id` VARCHAR(50) NOT NULL,
    `date` TIMESTAMP NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `location` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE,
    INDEX `idx_shipment` (`shipment_id`),
    INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. GUIDES TABLE
-- =====================================================
DROP TABLE IF EXISTS `guides`;
CREATE TABLE `guides` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(200) NOT NULL,
    `languages` JSON NOT NULL,
    `specializations_fr` JSON NOT NULL,
    `specializations_en` JSON NOT NULL,
    `cities` JSON NOT NULL,
    `experience` INT NOT NULL DEFAULT 0,
    `rating` DECIMAL(2, 1) DEFAULT 5.0,
    `reviews` INT DEFAULT 0,
    `avatar` VARCHAR(500),
    `price_per_day` DECIMAL(12, 2) NOT NULL,
    `price_per_hour` DECIMAL(12, 2) NOT NULL,
    `description_fr` TEXT,
    `description_en` TEXT,
    `available` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_available` (`available`),
    INDEX `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. GUIDE BOOKINGS TABLE
-- =====================================================
DROP TABLE IF EXISTS `guide_bookings`;
CREATE TABLE `guide_bookings` (
    `id` VARCHAR(50) PRIMARY KEY,
    `guide_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `service_type` ENUM('hourly', 'daily') NOT NULL DEFAULT 'daily',
    `hours` INT,
    `days` INT,
    `total_price` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`guide_id`) REFERENCES `guides`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_guide` (`guide_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. VISA TYPES TABLE
-- =====================================================
DROP TABLE IF EXISTS `visa_types`;
CREATE TABLE `visa_types` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name_fr` VARCHAR(200) NOT NULL,
    `name_en` VARCHAR(200) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `duration_fr` VARCHAR(100) NOT NULL,
    `duration_en` VARCHAR(100) NOT NULL,
    `validity_fr` VARCHAR(100) NOT NULL,
    `validity_en` VARCHAR(100) NOT NULL,
    `processing_time_fr` VARCHAR(100) NOT NULL,
    `processing_time_en` VARCHAR(100) NOT NULL,
    `cost` DECIMAL(12, 2) NOT NULL,
    `requirements_fr` JSON NOT NULL,
    `requirements_en` JSON NOT NULL,
    `description_fr` TEXT,
    `description_en` TEXT,
    `pdf_url` VARCHAR(500),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_type` (`type`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. VISA APPLICATIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS `visa_applications`;
CREATE TABLE `visa_applications` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `visa_type` VARCHAR(100) NOT NULL,
    `status` ENUM('pending', 'processing', 'approved', 'rejected') NOT NULL DEFAULT 'pending',

    -- Applicant information
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `nationality` VARCHAR(100) NOT NULL,
    `passport_number` VARCHAR(100) NOT NULL,
    `passport_expiry` DATE NOT NULL,

    -- Travel dates
    `departure_date` DATE NOT NULL,
    `return_date` DATE,

    -- Documents
    `documents` JSON,
    `notes` TEXT,
    `admin_notes` TEXT,

    `total_cost` DECIMAL(12, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_visa_type` (`visa_type`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 14. BLOG POSTS TABLE
-- =====================================================
DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE `blog_posts` (
    `id` VARCHAR(50) PRIMARY KEY,
    `title_fr` VARCHAR(500) NOT NULL,
    `title_en` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(500) UNIQUE NOT NULL,
    `excerpt_fr` TEXT NOT NULL,
    `excerpt_en` TEXT NOT NULL,
    `content_fr` LONGTEXT NOT NULL,
    `content_en` LONGTEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `author` VARCHAR(200) NOT NULL,
    `author_avatar` VARCHAR(500),
    `image` VARCHAR(500),
    `views` INT DEFAULT 0,
    `read_time` INT DEFAULT 5,
    `tags` JSON,
    `published_at` DATE,
    `is_published` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_slug` (`slug`),
    INDEX `idx_category` (`category`),
    INDEX `idx_published` (`is_published`, `published_at`),
    FULLTEXT INDEX `idx_search` (`title_fr`, `title_en`, `excerpt_fr`, `excerpt_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 15. FAQ TABLE
-- =====================================================
DROP TABLE IF EXISTS `faq`;
CREATE TABLE `faq` (
    `id` VARCHAR(50) PRIMARY KEY,
    `question_fr` TEXT NOT NULL,
    `question_en` TEXT NOT NULL,
    `answer_fr` TEXT NOT NULL,
    `answer_en` TEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `display_order` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_category` (`category`),
    INDEX `idx_active` (`is_active`),
    INDEX `idx_display_order` (`display_order`),
    FULLTEXT INDEX `idx_search` (`question_fr`, `question_en`, `answer_fr`, `answer_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 16. CART ITEMS TABLE
-- =====================================================
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
    INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 17. NOTIFICATIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(500),
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_read` (`is_read`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 18. ACTIVITY LOGS TABLE
-- =====================================================
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50),
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(50),
    `details` JSON,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_entity` (`entity_type`, `entity_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
