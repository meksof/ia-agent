import { InjectionToken } from '@angular/core';
import defaultConfig from './app.config.json';

export interface AppConfig {
  modelResponseTimeoutMs: number;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    ...defaultConfig,
    ...(typeof window !== 'undefined' ? window.__APP_CONFIG__ : {}),
  }),
});
