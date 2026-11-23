// https://github.com/yetone/magpie/blob/main/internal/gui/pagebridge.js
import type { PluginOptions } from './plugin';

interface MagpieTheme {
    dark: boolean;
    lang: string;
    tokens: Record<string, string>;
}

interface MagpieNamed {
    id: string;
    name: string;
}

interface Magpie {
    ready: Promise<MagpieTheme>;
    theme: MagpieTheme | null;
    context: { provider?: MagpieNamed };
    service: string;
    visible: boolean;
    onTheme(fn: (theme: MagpieTheme) => void): void;
    onVisibility(fn: (visible: boolean) => void): void;
    onAction(fn: (action: { id: string; provider?: MagpieNamed; agent?: MagpieNamed }) => void | Promise<void>): void;
    options: {
        get(): Promise<PluginOptions>;
        set(options: PluginOptions): Promise<PluginOptions>;
    };
    image: {
        copy(png: Blob): Promise<{ ok: boolean }>;
        save(png: Blob, name: string): Promise<{ path: string }>;
    };
}

declare global {
    interface Window {
        magpie?: Magpie;
    }
}
