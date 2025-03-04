import React from 'react';
import { EXCHANGE_LOGOS, EXCHANGE_STATUS } from '../lib/exchanges/constants';
import { ExchangeLogo } from './ExchangeLogo';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Badge } from './ui/badge';
import { Sparkles, Clock, Info, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ExchangeSelectorProps {
  onSelect: (exchangeName: string) => void;
  selectedExchange?: string;
}

export function ExchangeSelector({ onSelect, selectedExchange }: ExchangeSelectorProps) {
  const { t } = useLanguage();

  // Separar exchanges implementadas e não implementadas
  const implementedExchanges = Object.entries(EXCHANGE_STATUS)
    .filter(([, exchange]) => exchange.implemented)
    .sort(([, a], [, b]) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return a.name.localeCompare(b.name);
    });

  const upcomingExchanges = Object.entries(EXCHANGE_STATUS)
    .filter(([, exchange]) => !exchange.implemented)
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  console.log('Exchanges implementadas:', implementedExchanges);
  console.log('Exchanges em breve:', upcomingExchanges);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Exchanges Implementadas */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t.exchanges.availableExchanges}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {implementedExchanges.map(([key, exchange]) => (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={`
                  relative p-6 border-2 rounded-xl transition-all duration-200
                  ${selectedExchange === key 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                  ${exchange.priority ? 'md:col-span-2' : ''}
                `}
              >
                <div className="flex items-start space-x-4 w-full">
                  {/* Logo */}
                  <div className="relative">
                    <ExchangeLogo 
                      exchangeName={key as keyof typeof EXCHANGE_LOGOS}
                      className={`
                        transform transition-transform duration-200 hover:scale-110
                        ${exchange.priority ? 'w-16 h-16' : 'w-12 h-12'}
                      `}
                    />
                  </div>
                  
                  {/* Informações */}
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between">
                      <span className={`
                        font-bold text-gray-900 dark:text-gray-100
                        ${exchange.priority ? 'text-xl' : 'text-lg'}
                      `}>
                        {exchange.name}
                      </span>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-2 max-w-xs">
                            <p>{exchange.priority ? t.exchanges.recommendedExchange : t.exchanges.standardExchange}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <ShieldCheck className="w-4 h-4" />
                              <span>{t.exchanges.secureAndReliable}</span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Badges e Status */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {exchange.priority && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {t.exchanges.recommended}
                        </Badge>
                      )}
                      
                      {exchange.inProgress ? (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.exchanges.inProgress}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {t.exchanges.fullyImplemented}
                        </Badge>
                      )}
                    </div>

                    {/* Métricas */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{t.exchanges.highLiquidity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exchanges Em Breve */}
        {upcomingExchanges.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.exchanges.comingSoonTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {upcomingExchanges.map(([key, exchange]) => (
                <div
                  key={key}
                  className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative grayscale">
                      <ExchangeLogo 
                        exchangeName={key as keyof typeof EXCHANGE_LOGOS}
                        className="w-10 h-10"
                      />
                      <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-900/30 rounded-full" />
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        {exchange.name}
                      </span>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {t.exchanges.comingSoon}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
} 