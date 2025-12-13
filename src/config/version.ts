// Verze aplikace - načtena z package.json při buildu přes Vite define
declare const __APP_VERSION__: string;

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.3.0';
export const APP_NAME = 'Harmonia';
export const APP_DEMO_VERSION = `Demo v${APP_VERSION}`;

