import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { getSessionData } from '../lib/auth';
export function ProtectedRoute({ children }) {
    const session = getSessionData();
    if (!session) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
