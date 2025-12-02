-- Course and Teacher Feedback Schema
CREATE TABLE IF NOT EXISTS `course_feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `matieres`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_course_feedback` (`course_id`, `user_id`),
  INDEX `idx_course` (`course_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_created` (`created_at`)
);

CREATE TABLE IF NOT EXISTS `teacher_feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_teacher_feedback` (`teacher_id`, `user_id`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_created` (`created_at`)
);
