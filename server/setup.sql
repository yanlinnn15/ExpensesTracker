DROP DATABASE IF EXISTS petdb;
CREATE DATABASE petdb;
USE petdb;

-- Drop tables if they exist (in correct order)
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Budgets;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Icons;

-- Create Icons table first (no foreign keys)
CREATE TABLE Icons (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    icon_class VARCHAR(255) NOT NULL,
    icon_name VARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Users table
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    fName VARCHAR(255) NOT NULL,
    lName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    googleId VARCHAR(255),
    isGuest BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    lastActive DATETIME,
    registeredAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE Categories (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    is_income BOOLEAN NOT NULL DEFAULT false,
    UserId INTEGER,
    IconId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (IconId) REFERENCES Icons(id) ON DELETE SET NULL
);

-- Create Transactions table
CREATE TABLE Transactions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    remark VARCHAR(255),
    type BOOLEAN NOT NULL,
    UserId INTEGER,
    CategoryId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (CategoryId) REFERENCES Categories(id) ON DELETE CASCADE
);

-- Create Budgets table
CREATE TABLE Budgets (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(20,2) NOT NULL,
    remark VARCHAR(255),
    UserId INTEGER,
    CategoryId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (CategoryId) REFERENCES Categories(id) ON DELETE CASCADE
);

-- Insert some default icons if they don't exist
INSERT IGNORE INTO Icons (icon_class, icon_name) VALUES
('IconMoneybag', 'Money Bag'),
('IconCoin', 'Coin'),
('IconCash', 'Cash'),
('IconBuildingBank', 'Bank'),
('IconPigMoney', 'Savings'),
('IconShoppingCart', 'Shopping'),
('IconShirt', 'Clothing'),
('IconHome', 'Home'),
('IconCar', 'Transport'),
('IconDevices', 'Electronics');
