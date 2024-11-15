import {
  IconLayoutDashboard, IconMoneybag, IconTransfer, IconCoin, IconCategory
} from '@tabler/icons-react';

import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Transactions',
    icon: IconTransfer,
    href: '/transactions',
  },
  {
    id: uniqueId(),
    title: 'Balances',
    icon: IconCoin,
    href: '/balances',
  },
  {
    id: uniqueId(),
    title: 'Budgets',
    icon: IconMoneybag,
    href: 'Budgets',
  },
  {
    id: uniqueId(),
    title: 'Categories',
    icon: IconCategory,
    href: '/category',
  }
];

export default Menuitems;
