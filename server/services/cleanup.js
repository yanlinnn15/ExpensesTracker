const { Users, Categories, Transactions, Budgets } = require('../models');
const { Op } = require('sequelize');

// Cleanup inactive guest accounts and their related data
const cleanupGuestData = async () => {
    try {
        // Find guest accounts that haven't been active for 24 hours
        const inactiveGuests = await Users.findAll({
            where: {
                isGuest: true,
                lastActive: {
                    [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
                }
            }
        });

        for (const guest of inactiveGuests) {
            // Delete all related data
            await Transactions.destroy({ where: { UserId: guest.id } });
            await Categories.destroy({ where: { UserId: guest.id } });
            await Budgets.destroy({ where: { UserId: guest.id } });
            await guest.destroy();
        }

        console.log(`Cleaned up ${inactiveGuests.length} inactive guest accounts`);
    } catch (error) {
        console.error('Error in cleanup service:', error);
    }
};

module.exports = { cleanupGuestData };
