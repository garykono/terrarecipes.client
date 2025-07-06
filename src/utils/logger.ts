// logger.ts
let isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.log('[debug]', ...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info('[info]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[warn]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[error]', ...args);
  }
};