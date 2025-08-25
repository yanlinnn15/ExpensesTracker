const mysql = require('mysql2/promise');
const config = require('./config/config.json').development;

async function resetDatabase() {
    try {
        // First connect without database to drop and recreate it
        const connection = await mysql.createConnection({
            host: config.host,
            user: config.username,
            password: config.password
        });

        console.log('Connected to MySQL server');

        // Drop database if exists and recreate it
        await connection.query(`DROP DATABASE IF EXISTS ${config.database}`);
        await connection.query(`CREATE DATABASE ${config.database}`);
        console.log(`Database ${config.database} has been reset`);
        
        // Close initial connection
        await connection.end();
        
        // Now initialize models and create tables
        const { sequelize, Users, Icons, Categories } = require('./models');
        
        console.log('Creating tables...');
        await sequelize.sync({ force: true });
        console.log('Tables created successfully');

        // Create default icons
        console.log('Creating default icons...');
        const icons = await Icons.bulkCreate([
            { icon_name: 'Salary', icon_class: 'payments' },
            { icon_name: 'Part Time', icon_class: 'work' },
            { icon_name: 'Food', icon_class: 'restaurant' },
            { icon_name: 'Transport', icon_class: 'directions_car' },
            { icon_name: 'Shopping', icon_class: 'shopping_cart' },
            { icon_name: 'Entertainment', icon_class: 'movie' }
        ]);
        console.log(`Created ${icons.length} default icons`);

        // Create a test user to verify structure
        const testUser = await Users.create({
            fName: 'Test',
            lName: 'User',
            email: 'test@example.com',
            isGuest: true,
            active: true,
            lastActive: new Date()
        });
        console.log('Test user created:', testUser.id);

        // Verify the test user
        const verifyUser = await Users.findByPk(testUser.id);
        console.log('Verified user structure:', {
            id: verifyUser.id,
            fName: verifyUser.fName,
            isGuest: verifyUser.isGuest
        });

        console.log('Database reset and initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

console.log('Starting database reset...');
resetDatabase();
