import type { Language } from '@/types';

import type { ListItem } from './interfaces/api';

const languageCodes = new Map<string, Language>([
    ['en-US', 'en-us'],
    ['en-us', 'en-us'],
    ['en', 'en'],
    ['zh-TW', 'zh-TW'],
    ['zh-CN', 'zh-CN'],
]);

export function getLanguage(language?: string): Language | undefined {
    return languageCodes.get(language ?? '');
}

export function getFeedLanguage(items: ListItem[]): Language | undefined {
    const languages = new Set(items.map((item) => getLanguage(item.lang)));
    if (languages.has(undefined)) {
        return undefined;
    }
    return languages.size > 1 ? 'mul' : languages.values().next().value;
}
