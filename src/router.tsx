import React from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { MyBots } from './pages/MyBots';
import { NewBots } from './pages/NewBots';
import { Strategies } from './pages/Strategies';
import { Logs } from './pages/Logs';
import { PasswordRecovery } from './pages/PasswordRecovery';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Overview } from './pages/Overview';
import TestCalculo from './pages/TestCalculo';

// Exportar o router como uma constante nomeada
export const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/password-recovery",
      element: <PasswordRecovery />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout>
            <Outlet />
          </Layout>
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <Overview />,
        },
        {
          path: "bots",
          element: <MyBots />,
        },
        {
          path: "bots/:id",
          element: <NewBots />,
        },
        {
          path: "new-bots",
          element: <NewBots />,
        },
        {
          path: "strategies",
          element: <Strategies />,
        },
        {
          path: "logs",
          element: <Logs />,
        },
        {
          path: '/test-calculo',
          element: <TestCalculo />
        },
      ],
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true
    }
  }
); 