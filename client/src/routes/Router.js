import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ForgorPassLink from '../views/authentication/forgotpasslink';
import ProtectedRoute from '../helpers/ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')))
const Balances = Loadable(lazy(() => import('../views/balances/Balances')))
const AddTrans = Loadable(lazy(() => import('../views/transactions/addtrans')))
const AddExpenses = Loadable(lazy(() => import('../views/transactions/addexpense')))
const Transaction = Loadable(lazy(() => import('../views/transactions/transactions')))
const Profiles = Loadable(lazy(() => import('../views/profile/Profile')))
const Budgets = Loadable(lazy(() => import('../views/budgets/Budgets')))
const Categories = Loadable(lazy(() => import('../views/category/category')))
const Icons = Loadable(lazy(() => import('../views/icons/Icons')))
const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')))
const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')))
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const Verification = Loadable(lazy(() => import('../views/authentication/verification')));
const ForgotPassLink = Loadable(lazy(() => import('../views/authentication/forgotpasslink')));
const Verify = Loadable(lazy(() => import('../views/authentication/verify')));
const ResetPass = Loadable(lazy(() => import('../views/authentication/resetpass')));



const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/dashboard', exact: true, element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: '/transactions', exact: true, element: <ProtectedRoute><Transaction /></ProtectedRoute> },
      { path: '/addtrans', exact: true, element: <ProtectedRoute><AddTrans /></ProtectedRoute> },
      { path: '/addexpenses', exact: true, element: <ProtectedRoute><AddExpenses /></ProtectedRoute> },
      { path: '/balances', exact: true, element: <ProtectedRoute><Balances /></ProtectedRoute> },
      { path: '/profile/:id', exact: true, element: <ProtectedRoute><Profiles /></ProtectedRoute> },
      { path: '/budgets', exact: true, element: <ProtectedRoute><Budgets /></ProtectedRoute> },
      { path: '/category', exact: true, element: <ProtectedRoute><Categories /></ProtectedRoute> },
      { path: '/icons', exact: true, element: <ProtectedRoute><Icons /></ProtectedRoute> },
      { path: '/ui/typography', exact: true, element: <ProtectedRoute><TypographyPage /></ProtectedRoute> },
      { path: '/ui/shadow', exact: true, element: <ProtectedRoute><Shadow /></ProtectedRoute> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/verification', element: <Verification /> },
      { path: '/auth/forgotpasslink', element: <ForgotPassLink /> },
      { path: '/auth/resetpass', element: <ResetPass /> },
      { path: '/auth/verify/', element: <Verify /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default Router;
