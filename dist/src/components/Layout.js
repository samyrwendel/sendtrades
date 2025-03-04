import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigation } from './Navigation';
import { Logo } from './Logo';
export function Layout({ children }) {
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: _jsxs("div", { className: "flex h-screen overflow-hidden", children: [_jsx(Navigation, {}), _jsx("main", { className: "flex-1 relative z-0 overflow-y-auto focus:outline-none pb-16 md:pb-0", children: _jsxs("div", { className: "py-6", children: [_jsxs("div", { className: "md:hidden flex items-center justify-center mb-6", children: [_jsx(Logo, { className: "h-8 w-auto text-indigo-600 dark:text-indigo-400" }), _jsx("span", { className: "ml-2 text-xl font-semibold text-gray-900 dark:text-indigo-100", children: "TradingBot" })] }), _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 md:px-8", children: children })] }) })] }) }));
}
