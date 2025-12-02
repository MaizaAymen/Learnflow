-- Digital Library Schema
CREATE TABLE IF NOT EXISTS `library_books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255),
  `description` TEXT,
  `isbn` VARCHAR(20),
  `file_path` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` INT,
  `mime_type` VARCHAR(50),
  `uploaded_by_id` INT NOT NULL,
  `category` VARCHAR(100),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_created` (`created_at`)
);

CREATE TABLE IF NOT EXISTS `book_downloads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `book_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `downloaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`book_id`) REFERENCES `library_books`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_book` (`book_id`)
);

CREATE TABLE IF NOT EXISTS `book_feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `book_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`book_id`) REFERENCES `library_books`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_feedback` (`book_id`, `user_id`),
  INDEX `idx_book` (`book_id`),
  INDEX `idx_user` (`user_id`)
);

CREATE TABLE IF NOT EXISTS `book_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
