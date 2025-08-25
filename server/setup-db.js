const mysql = require('mysql2/promise');
const config = require('./config/config.json').development;

async function setupDatabase() {
    try {
        // First create the database if it doesn't exist
        const connection = await mysql.createConnection({
            host: config.host,
            user: config.username,
            password: config.password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database};`);
        console.log(`Database ${config.database} created or already exists`);
        await connection.end();

        // Now initialize models and create tables
        const { sequelize, Icons, Users, Categories } = require('./models');
        
        // Force sync all tables (this will drop existing tables)
        await sequelize.sync({ force: true });
        console.log('All tables have been synchronized');

        // Check if Icons table is empty
        const existingIcons = await Icons.findAll();
        if (existingIcons.length === 0) {
            // Create default icons
            await Icons.bulkCreate([
                { icon_name: 'Salary', icon_class: 'payments' },
                { icon_name: 'Part Time', icon_class: 'work' },
                { icon_name: 'Food', icon_class: 'restaurant' },
                { icon_name: 'Transport', icon_class: 'directions_car' },
                { icon_name: 'Shopping', icon_class: 'shopping_cart' },
                { icon_name: 'Entertainment', icon_class: 'movie' }
            ]);
            console.log('Default icons have been created');
        }

        // Create a test user to verify the Users table structure
        await Users.create({
            fName: 'Test',
            lName: 'User',
            email: 'test@example.com',
            isGuest: true,
            active: true
        });
        console.log('Test user created successfully');

        console.log('Database setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error);
        console.error('Error details:', error.stack);
        process.exit(1);
    }
}

setupDatabase();
