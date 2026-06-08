const ICONS = [
    { id: 1,  icon_class: 'IconMoneybag',    icon_name: 'Money Bag'   },
    { id: 2,  icon_class: 'IconCoin',         icon_name: 'Coin'        },
    { id: 3,  icon_class: 'IconCash',         icon_name: 'Cash'        },
    { id: 4,  icon_class: 'IconBuildingBank', icon_name: 'Bank'        },
    { id: 5,  icon_class: 'IconPigMoney',     icon_name: 'Savings'     },
    { id: 6,  icon_class: 'IconShoppingCart', icon_name: 'Shopping'    },
    { id: 7,  icon_class: 'IconShirt',        icon_name: 'Clothing'    },
    { id: 8,  icon_class: 'IconHome',         icon_name: 'Home'        },
    { id: 9,  icon_class: 'IconCar',          icon_name: 'Transport'   },
    { id: 10, icon_class: 'IconDevices',      icon_name: 'Electronics' },
];

const seedIcons = async (Icons, logger) => {
    const count = await Icons.count();
    if (count === 0) {
        await Icons.bulkCreate(ICONS);
        logger.info('Seeded icons table');
    }
};

module.exports = seedIcons;
