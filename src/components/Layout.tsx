import React from 'react';
import { Navigation } from './Navigation';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020202]">
      {/* Sidebar */}
      <Navigation />

      {/* Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none pb-20 lg:pb-0">
          <div className="py-6">
            {/* Logo para mobile */}
            <div className="lg:hidden flex items-center justify-center mb-6">
              <Logo className="h-8 w-auto text-[#0AD85E] dark:text-[#ADFFCE]" />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-[#ADFFCE]">
                TradingBot
              </span>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 