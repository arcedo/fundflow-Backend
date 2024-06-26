DROP DATABASE IF EXISTS fundflow;
CREATE DATABASE fundflow;

-- CREATE USER 'fundflow'@'%' IDENTIFIED BY 'fundflow2024';
-- GRANT ALL PRIVILEGES ON fundflow.* TO 'fundflow'@'%';
-- FLUSH PRIVILEGES;

-- USE fundflow;

CREATE TABLE fundflow.users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role BOOLEAN DEFAULT FALSE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50),
    lastName VARCHAR(50),
    biography VARCHAR(250),
    hashPassword VARCHAR(250),
    verified BOOLEAN DEFAULT FALSE,
    profilePictureSrc VARCHAR(250),
    bannerPictureSrc VARCHAR(250),
    googleAccount BOOLEAN DEFAULT FALSE,
    url VARCHAR(250) UNIQUE NOT NULL,
    registerDate VARCHAR(12),
    verifiedEmail BOOLEAN DEFAULT FALSE
);

CREATE TABLE fundflow.categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE
);

CREATE TABLE fundflow.projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    idCategory BIGINT UNSIGNED NOT NULL,
    idUser BIGINT UNSIGNED,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(250) NOT NULL,
    url VARCHAR(250) UNIQUE NOT NULL,
    about LONGTEXT,
    priceGoal BIGINT UNSIGNED DEFAULT NULL,
    currency VARCHAR(10) DEFAULT NULL,
    collGoal BIGINT UNSIGNED DEFAULT NULL,
    creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadlineDate DATE NOT NULL,
    coverImageSrc VARCHAR(250),
    FOREIGN KEY (idCategory) REFERENCES fundflow.categories(id),
    FOREIGN KEY (idUser) REFERENCES fundflow.users(id) ON DELETE SET NULL
);

-- Default categories
INSERT INTO fundflow.categories (name) VALUES ('Art'), ('Music'), ('Books'), ('Games'), ('Innove'), ('Dev');

-- Admin User
-- If this user is not created some tests in the backend will fail
INSERT INTO fundflow.users (`role`, username, email, hashPassword, verifiedEmail, `url`, profilePictureSrc)
VALUES (true, 'admin', 'marcarcedoalvaro25@gmail.com', '$2b$10$uqYGJ4JB/ijaFZWCYePMrOH8ZwMGrUTuIATE09/Lwn7648Sod4u7K', true, 'admin', 'uploads/defaultAvatars/1.svg');