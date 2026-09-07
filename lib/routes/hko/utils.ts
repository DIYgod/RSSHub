import { load } from 'cheerio';

const baseUrl = 'https://www.hko.gov.hk';
const languages = {
    en: 'en',
    tc: 'zh-HK',
    sc: 'zh-CN',
} as const;

type EditorialItem = Record<string, string | null | undefined>;

export type HkoLanguage = keyof typeof languages;

export const getLanguage = (language: string | undefined, defaultLanguage: HkoLanguage = 'en'): HkoLanguage => {
    const selectedLanguage = language ?? defaultLanguage;
    if (!Object.hasOwn(languages, selectedLanguage)) {
        throw new Error(`Unsupported language '${selectedLanguage}'. Supported languages are en, tc, and sc.`);
    }
    return selectedLanguage as HkoLanguage;
};

export const parseDataset = (data: string, itemField: string): EditorialItem[] => {
    const match = /^var\s+\w+\s*=\s*(\[.*\]);?\s*$/s.exec(data);
    if (!match) {
        throw new Error('Unable to parse the HKO editorial dataset.');
    }

    const items: unknown = JSON.parse(match[1]);
    if (!Array.isArray(items)) {
        throw new TypeError(`The HKO editorial dataset does not contain a ${itemField} array.`);
    }
    return items;
};

export const removeBom = (value: string): string => (value.startsWith(String.fromCodePoint(0xfeff)) ? value.slice(1) : value);

export const rewriteRelativeUrls = (html: string): string => {
    const $ = load(html, null, false);
    $('a[href], img[src]').each((_, element) => {
        const attribute = element.tagName === 'a' ? 'href' : 'src';
        const value = $(element).attr(attribute);
        if (value) {
            $(element).attr(attribute, new URL(value, baseUrl).href);
        }
    });
    return $.root().html() ?? '';
};

export const resolveHkoUrl = (url: string): string => new URL(url, baseUrl).href;
