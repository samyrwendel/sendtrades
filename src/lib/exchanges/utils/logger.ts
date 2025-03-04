/**
 * Utilitário de logging para as operações de exchange
 */
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data ? data : '');
  },
  
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data ? data : '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? data : '');
  },
  
  debug: (message: string, data?: any) => {
    console.debug(`[DEBUG] ${message}`, data ? data : '');
  }
}; 