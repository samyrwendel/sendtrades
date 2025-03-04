import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
export function PasswordRecovery() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');
        try {
            // In a real application, this would make an API call to initiate password recovery
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            setStatus('success');
        }
        catch (err) {
            setStatus('error');
            setError(t.auth.passwordRecoveryError);
        }
    };
    if (status === 'success') {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: _jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: t.auth.checkYourEmail }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: t.auth.recoveryEmailSent }), _jsx("div", { className: "mt-4 text-center", children: _jsx(Link, { to: "/login", className: "text-indigo-600 hover:text-indigo-500", children: t.auth.backToLogin }) })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: t.auth.resetPassword }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: t.auth.resetPasswordInstructions })] }), _jsx("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md", children: _jsx("div", { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10", children: _jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm", children: error })), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: t.auth.email }), _jsxs("div", { className: "mt-1 relative rounded-md shadow-sm", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Mail, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { id: "email", name: "email", type: "email", required: true, className: "focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md", placeholder: t.auth.emailPlaceholder, value: email, onChange: (e) => setEmail(e.target.value) })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: status === 'loading', className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400", children: status === 'loading' ? t.auth.sendingLink : t.auth.sendResetLink }) }), _jsx("div", { className: "text-center", children: _jsx(Link, { to: "/login", className: "text-sm text-indigo-600 hover:text-indigo-500", children: t.auth.backToLogin }) })] }) }) })] }));
}
