import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterButton, FilterOption } from '@/components/ui/filter-button';
import { ThemeSearchInput } from '@/components/ui/theme-search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogFilterProps {
  onFilterChange: (filters: LogFilters) => void;
}

export interface LogFilters {
  search: string;
  startDate: string;
  endDate: string;
  type: string;
  dateRange: string;
}

export function LogFilter({ onFilterChange }: LogFilterProps) {
  const [search, setSearch] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [type, setType] = React.useState('order');
  const [dateRange, setDateRange] = React.useState('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onFilterChange({ search: e.target.value, startDate, endDate, type, dateRange });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartDate(value);
      onFilterChange({ search, startDate: value, endDate, type, dateRange });
    } else {
      setEndDate(value);
      onFilterChange({ search, startDate, endDate: value, type, dateRange });
    }
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    onFilterChange({ search, startDate, endDate, type: value, dateRange });
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    
    // Configurar datas com base no intervalo selecionado
    const today = new Date();
    let start = '';
    let end = '';
    
    switch (value) {
      case 'today':
        start = today.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start = yesterday.toISOString().split('T')[0];
        end = yesterday.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      case 'custom':
        // Manter as datas personalizadas
        break;
      default:
        // Limpar datas para 'all'
        start = '';
        end = '';
    }
    
    setStartDate(start);
    setEndDate(end);
    
    onFilterChange({ 
      search, 
      startDate: start, 
      endDate: end, 
      type, 
      dateRange: value 
    });
  };

  const typeOptions: FilterOption[] = [
    { value: 'all', label: 'Todos os Logs' },
    { value: 'webhook', label: 'Webhooks' },
    { value: 'system', label: 'Logs do Sistema' },
    { value: 'order', label: 'Ordens Executadas' },
    { value: 'test', label: 'Logs de Teste' },
  ];

  const dateOptions: FilterOption[] = [
    { value: 'all', label: 'Todas as Datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Último Mês' },
    { value: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <ThemeSearchInput
          placeholder="Buscar por nome do bot ou ID..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <FilterButton
        icon={Filter}
        label="Tipo de Log"
        value={type}
        onValueChange={handleTypeChange}
        options={typeOptions}
      />

      <FilterButton
        icon={Calendar}
        label="Período"
        value={dateRange}
        onValueChange={handleDateRangeChange}
        options={dateOptions}
      />

      {dateRange === 'custom' && (
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="pl-3 appearance-none cursor-pointer bg-black dark:bg-black border border-[#272727] dark:border-[#272727] text-white hover:bg-gray-900 hover:border-[#0AD85E]/30 transition-colors focus:ring-[#0AD85E] focus:border-[#0AD85E] focus:ring-offset-0 h-10 dark:[color-scheme:dark]"
            />
          </div>
          <div className="relative">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="pl-3 appearance-none cursor-pointer bg-black dark:bg-black border border-[#272727] dark:border-[#272727] text-white hover:bg-gray-900 hover:border-[#0AD85E]/30 transition-colors focus:ring-[#0AD85E] focus:border-[#0AD85E] focus:ring-offset-0 h-10 dark:[color-scheme:dark]"
            />
          </div>
        </div>
      )}
    </div>
  );
} 