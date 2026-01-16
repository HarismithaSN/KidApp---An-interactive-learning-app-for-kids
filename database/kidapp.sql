CREATE DATABASE IF NOT EXISTS kidapp DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kidapp;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(100),
  age INT,
  avatar VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE content_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  type VARCHAR(50),
  tags TEXT,
  difficulty INT DEFAULT 1
);

CREATE TABLE progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT,
  activity_key VARCHAR(255),
  stars INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- sample content
INSERT INTO content_items (title,type,tags,difficulty) VALUES
('Alphabet A','lesson','alphabet,letters,a,beginner',1),
('Count 1 to 10','lesson','numbers,counting,beginner',1);
