import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Outlet } from 'react-router-dom';
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
export const router = createBrowserRouter([
    {
        path: "/login",
        element: _jsx(Login, {}),
    },
    {
        path: "/password-recovery",
        element: _jsx(PasswordRecovery, {}),
    },
    {
        path: "/",
        element: (_jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(Outlet, {}) }) })),
        children: [
            {
                path: "",
                element: _jsx(Overview, {}),
            },
            {
                path: "bots",
                element: _jsx(MyBots, {}),
            },
            {
                path: "bots/:id",
                element: _jsx(NewBots, {}),
            },
            {
                path: "new-bots",
                element: _jsx(NewBots, {}),
            },
            {
                path: "strategies",
                element: _jsx(Strategies, {}),
            },
            {
                path: "logs",
                element: _jsx(Logs, {}),
            },
            {
                path: '/test-calculo',
                element: _jsx(TestCalculo, {})
            },
        ],
    },
]);
