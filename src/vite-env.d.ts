/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: Record<string, any>;
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: string[], cb: (mods: any[]) => void): void;
    prune(cb: () => void): void;
    dispose(cb: (data: Record<string, any>) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
    send(event: string, data?: any): void;
  };
}

// Declaração global para o tratamento de erros do HMR
interface Window {
  __HMR_TIMEOUT_MS__?: number;
  __HMR_MAX_RETRIES__?: number;
  __HMR_RETRY_COUNT__?: number;
}

export {};
