import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Button } from '../components/ui/button';

export function PasswordRecovery() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      // In a real application, this would make an API call to initiate password recovery
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(t.auth.passwordRecoveryError);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t.auth.checkYourEmail}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t.auth.recoveryEmailSent}
          </p>
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-500"
            >
              {t.auth.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t.auth.resetPassword}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t.auth.resetPasswordInstructions}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.auth.email}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={status === 'loading'}
                variant="success"
                className="w-full"
              >
                {status === 'loading' ? t.auth.sendingLink : t.auth.sendResetLink}
              </Button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {t.auth.backToLogin}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}