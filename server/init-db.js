const { sequelize, Icons } = require('./models');

async function initializeDatabase() {
    try {
        // Force sync all tables
        console.log('Syncing database tables...');
        await sequelize.sync({ force: true });
        console.log('Database tables created successfully');

        // Create default icons
        console.log('Creating default icons...');
        await Icons.bulkCreate([
            { icon_name: 'Money', icon_class: 'payments' },
            { icon_name: 'Work', icon_class: 'work' },
            { icon_name: 'Investment', icon_class: 'trending_up' },
            { icon_name: 'Gift', icon_class: 'card_giftcard' },
            { icon_name: 'Food', icon_class: 'restaurant' },
            { icon_name: 'Transport', icon_class: 'directions_car' },
            { icon_name: 'Shopping', icon_class: 'shopping_cart' },
            { icon_name: 'Entertainment', icon_class: 'movie' },
            { icon_name: 'Bills', icon_class: 'receipt' },
            { icon_name: 'Health', icon_class: 'local_hospital' }
        ]);

        console.log('Default icons created successfully');
        console.log('Database initialization completed');

        // Exit successfully
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

// Run the initialization
console.log('Starting database initialization...');
initializeDatabase();
