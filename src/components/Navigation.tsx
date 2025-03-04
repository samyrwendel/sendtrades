import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bot, BarChart2, Settings, Activity, List, Languages, LogOut, Sun, Moon, Menu, ChevronLeft, MoreVertical } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useTheme } from '../lib/theme/ThemeContext';
import { cn } from '../lib/utils';

export function Navigation() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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
    const newLanguage = language === 'en' ? 'pt' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    setIsMoreMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('session');
    navigate('/login');
  };

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setIsMoreMenuOpen(false);
  };

  const navButtonClass = cn(
    "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
    "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    "dark:text-white dark:hover:bg-[#050505] dark:hover:text-[#0AD85E]",
    isCollapsed && "justify-center"
  );

  return (
    <>
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div
          className={cn(
            "flex flex-col flex-grow bg-white dark:bg-[#030303] border-r border-gray-200 dark:border-gray-700 pt-5 pb-4",
            isCollapsed ? "lg:w-20" : "lg:w-64"
          )}
        >
          {/* Collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-12 p-1 bg-white dark:bg-[#030303] rounded-full shadow-md border border-gray-200 dark:border-gray-700"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform",
              isCollapsed && "transform rotate-180"
            )} />
          </button>

          <div className="flex flex-col flex-grow">
            {/* Logo */}
            <div className={cn(
              "flex items-center px-4",
              isCollapsed ? "justify-center" : "justify-start"
            )}>
              <Bot className="h-8 w-8 text-[#0AD85E] dark:text-[#0AD85E]" />
              {!isCollapsed && (
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                  TradingBot
                </span>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 mt-5 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      navButtonClass,
                      isActive
                        ? "bg-[#0AD85E]/10 text-[#0AD85E] dark:bg-[#050505] dark:text-[#0AD85E]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-white dark:hover:bg-[#050505] dark:hover:text-[#0AD85E]"
                    )
                  }
                >
                  <item.icon className={cn("flex-shrink-0 h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLanguageChange}
                className={navButtonClass}
              >
                <Languages className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                {!isCollapsed && <span>{language === 'en' ? 'PT-BR' : 'EN'}</span>}
              </button>

              <button
                onClick={handleThemeChange}
                className={navButtonClass}
              >
                {theme === 'dark' ? (
                  <Sun className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                ) : (
                  <Moon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                )}
                {!isCollapsed && <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>}
              </button>

              <button
                onClick={handleLogout}
                className={navButtonClass}
              >
                <LogOut className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                {!isCollapsed && <span>Sair</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação inferior para mobile/tablet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#030303] border-t border-gray-200 dark:border-gray-700">
        <nav className="flex items-center justify-around h-16">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-[#0AD85E] dark:text-[#0AD85E]"
                    : "text-gray-600 dark:text-white hover:text-[#0AD85E] dark:hover:text-[#0AD85E]"
                )
              }
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span>{item.title}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="flex flex-col items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 dark:text-white hover:text-[#0AD85E] dark:hover:text-[#0AD85E]"
          >
            <MoreVertical className="h-6 w-6 mb-1" />
            <span>Mais</span>
          </button>
        </nav>

        {/* Menu mais opções */}
        {isMoreMenuOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-white dark:bg-[#030303] shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            <button
              onClick={handleLanguageChange}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 hover:text-[#0AD85E] dark:hover:bg-[#050505] dark:hover:text-[#0AD85E] rounded-md"
            >
              <Languages className="h-5 w-5 mr-3" />
              <span>{language === 'en' ? 'PT-BR' : 'EN'}</span>
            </button>
            <button
              onClick={handleThemeChange}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 hover:text-[#0AD85E] dark:hover:bg-[#050505] dark:hover:text-[#0AD85E] rounded-md"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 mr-3" />
              ) : (
                <Moon className="h-5 w-5 mr-3" />
              )}
              <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
} 