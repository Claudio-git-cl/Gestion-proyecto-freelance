import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Client pages
import ClientList from './pages/clients/ClientList';
import ClientForm from './pages/clients/ClientForm';
import ClientDetails from './pages/clients/ClientDetails';

// Project pages
import ProjectList from './pages/projects/ProjectList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectDetails from './pages/projects/ProjectDetails';

// Time tracking pages
import TimeTracker from './pages/time/TimeTracker';
import TimeEntryList from './pages/time/TimeEntryList';

// Invoice pages
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceForm from './pages/invoices/InvoiceForm';
import InvoiceDetails from './pages/invoices/InvoiceDetails';

// Auth guard
import AuthGuard from './components/AuthGuard';
import GuestGuard from './components/GuestGuard';

const routes = [
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <GuestGuard>
            <Login />
          </GuestGuard>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestGuard>
            <Register />
          </GuestGuard>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <GuestGuard>
            <ForgotPassword />
          </GuestGuard>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <GuestGuard>
            <ResetPassword />
          </GuestGuard>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      // Client routes
      {
        path: 'clients',
        element: <ClientList />,
      },
      {
        path: 'clients/new',
        element: <ClientForm />,
      },
      {
        path: 'clients/:id',
        element: <ClientDetails />,
      },
      {
        path: 'clients/:id/edit',
        element: <ClientForm />,
      },
      // Project routes
      {
        path: 'projects',
        element: <ProjectList />,
      },
      {
        path: 'projects/new',
        element: <ProjectForm />,
      },
      {
        path: 'projects/:id',
        element: <ProjectDetails />,
      },
      {
        path: 'projects/:id/edit',
        element: <ProjectForm />,
      },
      // Time tracking routes
      {
        path: 'time-tracker',
        element: <TimeTracker />,
      },
      {
        path: 'time-entries',
        element: <TimeEntryList />,
      },
      // Invoice routes
      {
        path: 'invoices',
        element: <InvoiceList />,
      },
      {
        path: 'invoices/new',
        element: <InvoiceForm />,
      },
      {
        path: 'invoices/:id',
        element: <InvoiceDetails />,
      },
      {
        path: 'invoices/:id/edit',
        element: <InvoiceForm />,
      },
      {
        path: '404',
        element: <NotFound />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
];

export default routes;