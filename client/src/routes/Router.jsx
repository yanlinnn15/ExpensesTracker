import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import(/* webpackPrefetch: true */ '../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import(/* webpackPrefetch: true */ '../layouts/blank/BlankLayout')));

/* ****Pages***** */
// Auth pages - load immediately
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const GoogleCallback = Loadable(lazy(() => import('../views/authentication/GoogleCallback')));

// Main pages - load after auth
const Dashboard = Loadable(lazy(() => import(/* webpackPrefetch: true */ '../views/dashboard/Dashboard')));
const Transaction = Loadable(lazy(() => import(/* webpackPrefetch: true */ '../views/transactions/transactions')));
const Balances = Loadable(lazy(() => import(/* webpackPrefetch: true */ '../views/balances/Balances')));

// Secondary pages - load on demand
const AddTrans = Loadable(lazy(() => import('../views/transactions/addtrans')));
const AddExpenses = Loadable(lazy(() => import('../views/transactions/addexpense')));
const Profiles = Loadable(lazy(() => import('../views/profile/Profile')));
const Budgets = Loadable(lazy(() => import('../views/budgets/Budgets')));
const Categories = Loadable(lazy(() => import('../views/category/category')));
const Icons = Loadable(lazy(() => import('../views/icons/Icons')));
const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')));
const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')));

const Router = [
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: 'login', element: <Login /> },
      { path: 'google-callback', element: <GoogleCallback /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/auth/login" /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/transactions', element: <Transaction /> },
      { path: '/addtrans', element: <AddTrans /> },
      { path: '/addexpenses', element: <AddExpenses /> },
      { path: '/balances', element: <Balances /> },
      { path: '/profile/:id', element: <Profiles /> },
      { path: '/budgets', element: <Budgets /> },
      { path: '/category', element: <Categories /> },
      { path: '/icons', element: <Icons /> },
      { path: '/ui/typography', element: <TypographyPage /> },
      { path: '/ui/shadow', element: <Shadow /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  }
];

export default Router;
