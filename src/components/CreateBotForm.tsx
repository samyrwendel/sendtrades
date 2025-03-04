import { FormEvent, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from './ui/button';

interface CreateBotFormData {
  apiKey: string;
  secretKey: string;
  exchange: string;
}

interface CreateBotFormProps {
  onSubmit: (data: CreateBotFormData) => void;
  error?: string;
}

export function CreateBotForm({ onSubmit, error }: CreateBotFormProps) {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [exchange] = useState('MEXC');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      apiKey,
      secretKey,
      exchange
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-4">{t.bots.createBot}</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">{t.bots.selectExchange}</label>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <img src="/mexc-logo.png" alt="MEXC Logo" className="w-8 h-8" />
              <div>
                <div className="font-medium">MEXC</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="secretKey" className="block text-sm font-medium mb-2">
              Secret Key
            </label>
            <input
              type="password"
              id="secretKey"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          {t.bots.apiKeysStoredLocally}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.bots.apiKeysPermissions}
        </p>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error === t.errors.ipNotAuthorized ? (
            <div>
              <p className="font-medium">{t.errors.credentialsValidationError}:</p>
              <p>{error}</p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t.common.toResolve}:
              </p>
              <ol className="list-decimal list-inside ml-2 text-gray-600 dark:text-gray-400">
                <li>{t.common.accessMexcAccount}</li>
                <li>{t.common.goToApiManagement}</li>
                <li>{t.common.editApiKey}</li>
                <li>{t.common.addCurrentIp}</li>
                <li>{t.common.waitAndTryAgain}</li>
              </ol>
            </div>
          ) : (
            <span>{t.errors.credentialsValidationError}: {error}</span>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          {t.common.cancel}
        </Button>
        <Button
          type="submit"
          variant="success"
        >
          {t.bots.validateAndContinue}
        </Button>
      </div>
    </form>
  );
} 