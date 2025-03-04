import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart2, Settings, Activity, List, Languages, LogOut, Sun, Moon, Menu, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useTheme } from '../lib/theme/ThemeContext';
import { cn } from '../lib/utils';
export function Navigation() {
    const { t, currentLanguage, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuItems = [
        {
            title: t.dashboard.overview,
            href: '/',
            icon: BarChart2
        },
        {
            title: t.dashboard.myBots,
            href: '/bots',
            icon: List
        },
        {
            title: t.dashboard.strategies,
            href: '/strategies',
            icon: Settings
        },
        {
            title: t.dashboard.logs,
            href: '/logs',
            icon: Activity
        }
    ];
    const handleLanguageChange = () => {
        setLanguage(currentLanguage === 'en' ? 'pt-BR' : 'en');
    };
    const handleLogout = () => {
        localStorage.removeItem('session');
        navigate('/login');
    };
    const handleThemeChange = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    const navButtonClass = cn("flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors", "text-gray-600 hover:bg-gray-50 hover:text-gray-900", "dark:text-indigo-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-100", isCollapsed && "justify-center");
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen), className: "md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg", children: _jsx(Menu, { className: "h-6 w-6" }) }), isMobileMenuOpen && (_jsx("div", { className: "md:hidden fixed inset-0 bg-black/50 z-40", onClick: () => setIsMobileMenuOpen(false) })), _jsxs("div", { className: cn("flex flex-col h-full transition-all duration-300", isCollapsed ? "w-16" : "w-64", "fixed md:relative", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0", "z-50 bg-white dark:bg-gray-800 shadow-lg md:shadow-none"), children: [_jsx("button", { onClick: () => setIsCollapsed(!isCollapsed), className: "hidden md:flex absolute -right-3 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700", children: _jsx(ChevronLeft, { className: cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180") }) }), _jsx("nav", { className: "flex-1", children: _jsx("div", { className: "space-y-1 p-2", children: menuItems.map((item) => (_jsxs(NavLink, { to: item.href, className: ({ isActive }) => cn("flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors", isActive
                                    ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-indigo-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-100", isCollapsed && "justify-center"), onClick: () => setIsMobileMenuOpen(false), children: [_jsx(item.icon, { className: cn("h-5 w-5", !isCollapsed && "mr-3") }), !isCollapsed && _jsx("span", { children: item.title })] }, item.href))) }) }), _jsxs("div", { className: "border-t dark:border-indigo-800/30 p-2", children: [_jsxs("button", { onClick: handleLanguageChange, className: navButtonClass, children: [_jsx(Languages, { className: cn("h-5 w-5", !isCollapsed && "mr-3") }), !isCollapsed && (currentLanguage === 'en' ? '🇺🇸 EN-US' : '🇧🇷 PT-BR')] }), _jsx("button", { onClick: handleThemeChange, className: navButtonClass, children: theme === 'dark' ? (_jsxs(_Fragment, { children: [_jsx(Sun, { className: cn("h-5 w-5", !isCollapsed && "mr-3") }), !isCollapsed && "Tema Claro"] })) : (_jsxs(_Fragment, { children: [_jsx(Moon, { className: cn("h-5 w-5", !isCollapsed && "mr-3") }), !isCollapsed && "Tema Escuro"] })) }), _jsxs("button", { onClick: handleLogout, className: cn("flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors", "text-red-600 hover:bg-red-50 hover:text-red-700", "dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300", isCollapsed && "justify-center"), children: [_jsx(LogOut, { className: cn("h-5 w-5", !isCollapsed && "mr-3") }), !isCollapsed && t.dashboard.logout] })] })] }), _jsx("div", { className: "md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50", children: _jsx("div", { className: "flex justify-around p-2", children: menuItems.map((item) => (_jsxs(NavLink, { to: item.href, className: ({ isActive }) => cn("flex flex-col items-center p-2 rounded-md", isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-600 dark:text-gray-400"), children: [_jsx(item.icon, { className: "h-5 w-5" }), _jsx("span", { className: "text-xs mt-1", children: item.title })] }, item.href))) }) })] }));
}
