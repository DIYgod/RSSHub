// https://github.com/yetone/magpie/blob/main/internal/gui/pagebridge.js

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
    onAction(fn: (action: { id: string; provider?: MagpieNamed; agent?: MagpieNamed }) => unknown): void;
    options: {
        get(): Promise<Record<string, unknown>>;
        set(options: Record<string, unknown>): Promise<Record<string, unknown>>;
    };
    read(name: string, params?: unknown): Promise<unknown>;
    image: {
        copy(png: Blob): Promise<unknown>;
        save(png: Blob, name: string): Promise<{ path: string }>;
    };
}

interface Window {
    magpie?: Magpie;
}
