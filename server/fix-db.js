const mysql = require('mysql2/promise');
const config = require('./config/config.json').development;

async function fixDatabase() {
    try {
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: config.host,
            user: config.username,
            password: config.password,
            database: config.database,
            multipleStatements: true
        });

        console.log('Connected to database');

        // Drop and recreate the Users table with correct structure
        const dropAndCreateUsers = `
            DROP TABLE IF EXISTS Users;
            CREATE TABLE Users (
                id INT NOT NULL AUTO_INCREMENT,
                fName VARCHAR(255) NOT NULL,
                lName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                googleId VARCHAR(255),
                isGuest BOOLEAN NOT NULL DEFAULT false,
                active BOOLEAN NOT NULL DEFAULT true,
                lastActive DATETIME,
                registeredAt DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            );
        `;

        console.log('Recreating Users table...');
        await connection.query(dropAndCreateUsers);
        console.log('Users table recreated');

        // Create default icons if they don't exist
        const createIcons = `
            CREATE TABLE IF NOT EXISTS Icons (
                id INT NOT NULL AUTO_INCREMENT,
                icon_name VARCHAR(255) NOT NULL,
                icon_class VARCHAR(255) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            );
        `;

        console.log('Creating Icons table...');
        await connection.query(createIcons);

        // Insert default icons
        const insertIcons = `
            INSERT INTO Icons (icon_name, icon_class) VALUES
            ('Salary', 'payments'),
            ('Part Time', 'work'),
            ('Food', 'restaurant'),
            ('Transport', 'directions_car'),
            ('Shopping', 'shopping_cart'),
            ('Entertainment', 'movie')
            ON DUPLICATE KEY UPDATE icon_name=VALUES(icon_name);
        `;

        console.log('Inserting default icons...');
        await connection.query(insertIcons);
        console.log('Default icons created');

        // Create Categories table
        const createCategories = `
            CREATE TABLE IF NOT EXISTS Categories (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                is_income BOOLEAN NOT NULL DEFAULT false,
                UserId INT,
                IconId INT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (IconId) REFERENCES Icons(id) ON DELETE SET NULL
            );
        `;

        console.log('Creating Categories table...');
        await connection.query(createCategories);
        console.log('Categories table created');

        // Test user creation
        const createTestUser = `
            INSERT INTO Users (fName, lName, email, isGuest, active)
            VALUES ('Test', 'User', 'test@example.com', true, true);
        `;

        console.log('Creating test user...');
        await connection.query(createTestUser);
        console.log('Test user created');

        await connection.end();
        console.log('Database setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing database:', error);
        process.exit(1);
    }
}

console.log('Starting database fix...');
fixDatabase();
