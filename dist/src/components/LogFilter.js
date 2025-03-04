import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
export function LogFilter({ onFilterChange }) {
    const [search, setSearch] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [type, setType] = React.useState('order');
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        onFilterChange({ search: e.target.value, startDate, endDate, type });
    };
    const handleDateChange = (field, value) => {
        if (field === 'start') {
            setStartDate(value);
            onFilterChange({ search, startDate: value, endDate, type });
        }
        else {
            setEndDate(value);
            onFilterChange({ search, startDate, endDate: value, type });
        }
    };
    const handleTypeChange = (value) => {
        setType(value);
        onFilterChange({ search, startDate, endDate, type: value });
    };
    return (_jsxs("div", { className: "flex flex-wrap gap-4 mb-6", children: [_jsx("div", { className: "flex-1 min-w-[200px]", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-gray-500" }), _jsx(Input, { placeholder: "Buscar por nome do bot ou ID...", value: search, onChange: handleSearchChange, className: "pl-9" })] }) }), _jsx("div", { className: "w-[200px]", children: _jsxs(Select, { value: type, onValueChange: handleTypeChange, children: [_jsxs(SelectTrigger, { children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), _jsx(SelectValue, { placeholder: "Tipo de Log" })] }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "Todos os Logs" }), _jsx(SelectItem, { value: "webhook", children: "Webhooks" }), _jsx(SelectItem, { value: "system", children: "Logs do Sistema" }), _jsx(SelectItem, { value: "order", children: "Ordens Executadas" }), _jsx(SelectItem, { value: "test", children: "Logs de Teste" })] })] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "relative", children: _jsx(Input, { type: "date", value: startDate, onChange: (e) => handleDateChange('start', e.target.value), className: "pl-3 appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:[color-scheme:dark]" }) }), _jsx("div", { className: "relative", children: _jsx(Input, { type: "date", value: endDate, onChange: (e) => handleDateChange('end', e.target.value), className: "pl-3 appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:[color-scheme:dark]" }) })] })] }));
}
