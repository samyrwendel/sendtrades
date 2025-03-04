import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import useTheme from '../hooks/useTheme';
export function Dashboard() {
    const { theme } = useTheme();
    useEffect(() => {
        // Força a cor do título via JavaScript
        const titles = document.querySelectorAll('h2.text-xl.font-semibold');
        titles.forEach(title => {
            if (theme === 'dark') {
                title.style.color = '#FFFFFF';
            }
            else {
                title.style.color = '#1F2937'; // Cor escura para tema claro
            }
        });
    }, [theme]);
    return (_jsx("div", { className: "p-6", children: _jsx("h2", { className: "text-xl font-semibold", children: "Bots Ativos" }) }));
}
