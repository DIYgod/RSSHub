export const SITE_URL = 'https://cohere.com';

export const resolveSafeUrl = (raw?: string): string | undefined => {
    if (!raw) {
        return undefined;
    }
    const trimmed = raw.trim();
    if (!trimmed) {
        return undefined;
    }
    if (trimmed.startsWith('#')) {
        return trimmed;
    }
    try {
        const parsed = new URL(trimmed, SITE_URL);
        if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
            return parsed.href;
        }
    } catch {
        return undefined;
    }
    return undefined;
};

export const assetFilename = (url: string) => {
    try {
        const { pathname } = new URL(url, SITE_URL);
        return pathname.slice(pathname.lastIndexOf('/') + 1);
    } catch {
        return url;
    }
};
