import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Button } from '../components/ui';
import { PageLayout, PageHeader, PageContent } from "../components/ui/page-layout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCellSecondary, EmptyState } from "../components/ui/data-table";
import { themeClasses } from "../lib/theme/colors";

interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: {
    entryType: 'market' | 'limit';
    stopLoss: number;
    takeProfit: number;
    leverage: number;
  };
  botId: string;
}

export function Strategies() {
  const { t } = useLanguage();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null);

  const handleCreateStrategy = () => {
    setCurrentStrategy(null);
    setIsModalOpen(true);
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setCurrentStrategy(strategy);
    setIsModalOpen(true);
  };

  const handleDeleteStrategy = (strategyId: string) => {
    if (confirm(t.strategies.confirmDelete)) {
      setStrategies(strategies.filter(strategy => strategy.id !== strategyId));
    }
  };

  return (
    <PageLayout>
      <PageHeader title={t.strategies.title}>
        <Button 
          onClick={() => setIsModalOpen(true)}
          variant="success"
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t.strategies.newStrategy}
        </Button>
      </PageHeader>

      <PageContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.common.name}</TableHead>
              <TableHead>{t.common.description}</TableHead>
              <TableHead>{t.common.parameters}</TableHead>
              <TableHead>{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map((strategy) => (
              <TableRow key={strategy.id}>
                <TableCell>
                  <div className="font-medium">{strategy.name}</div>
                </TableCell>
                <TableCellSecondary>{strategy.description}</TableCellSecondary>
                <TableCellSecondary>
                  <div>{t.strategies.entry}: {strategy.parameters.entryType}</div>
                  <div>{t.strategies.stopLoss}: {strategy.parameters.stopLoss}%</div>
                  <div>{t.strategies.takeProfit}: {strategy.parameters.takeProfit}%</div>
                  <div>{t.strategies.leverage}: {strategy.parameters.leverage}x</div>
                </TableCellSecondary>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStrategy(strategy)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStrategy(strategy.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {strategies.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState message={t.strategies.noStrategies} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </PageContent>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={cn("rounded-lg p-6 w-full max-w-lg", themeClasses.card.base)}>
            <h3 className={themeClasses.heading.h3}>
              {currentStrategy ? t.strategies.editStrategy : t.strategies.createStrategy}
            </h3>
            <form className="space-y-4">
              <div>
                <label className={cn("block text-sm font-medium", themeClasses.text.primary)}>
                  {t.common.name}
                </label>
                <input
                  type="text"
                  className={cn("mt-1 block w-full rounded-md", themeClasses.input.base, themeClasses.input.focus)}
                  placeholder={t.strategies.namePlaceholder}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium", themeClasses.text.primary)}>
                  {t.common.description}
                </label>
                <textarea
                  className={cn("mt-1 block w-full rounded-md", themeClasses.input.base, themeClasses.input.focus)}
                  rows={3}
                  placeholder={t.strategies.descriptionPlaceholder}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium", themeClasses.text.primary)}>
                  {t.strategies.entryType}
                </label>
                <select className={cn("mt-1 block w-full rounded-md", themeClasses.input.base, themeClasses.input.focus, themeClasses.input.success)}>
                  <option value="market">{t.strategies.market}</option>
                  <option value="limit">{t.strategies.limit}</option>
                </select>
              </div>
              <div>
                <label className={cn("block text-sm font-medium", themeClasses.text.primary)}>
                  {t.strategies.stopLoss} (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={cn("mt-1 block w-full rounded-md", themeClasses.input.base, themeClasses.input.focus)}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium", themeClasses.text.primary)}>
                  {t.strategies.takeProfit} (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={cn("mt-1 block w-full rounded-md", themeClasses.input.base, themeClasses.input.focus)}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium", themeClasses.text.primary)}>
                  {t.strategies.leverage}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className={cn("mt-1 block w-full rounded-md", themeClasses.input.base, themeClasses.input.focus)}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="success"
                >
                  {currentStrategy ? t.common.save : t.common.create}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}