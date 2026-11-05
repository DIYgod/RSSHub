declare module '*assets/build/playwright-worker.mjs' {
    import type { chromium } from 'patchright';

    interface PlaywrightCore {
        getPlaywrightVersion: () => string;
        inprocess: {
            playwright: { chromium: typeof chromium };
        };
        server: {
            WebSocketTransport: {
                connect: (...args: any[]) => Promise<any>;
            };
        };
    }

    export function getPlaywrightCore(): Promise<PlaywrightCore>;
}
