import React, { useState, useEffect } from 'react';
import { PageLayout, PageHeader, PageContent, PageSection } from '../components/ui/page-layout';
import { Button, ThemeUpdateButton } from '../components/ui';

      <PageHeader title={t.settings.title}>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-[var(--md-on-surface)]">
            {t.settings.title}
          </h1>
          <div className="flex items-center">
            {saveError && (
              <div className="text-sm text-[var(--md-error)] dark:text-[var(--md-error-light)] mr-2">
                {saveError}
              </div>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving || !hasChanges}
              variant="success"
              className="flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.common.saving}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t.common.save}
                </>
              )}
            </Button>
          </div>
        </div>
      </PageHeader> 