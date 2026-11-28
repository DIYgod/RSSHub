import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { renderDescription } from './templates/description';

const baseUrl = 'https://www.gq.com.tw';

const categoryTitleMap = {
    life: 'LIFE',
    fashion: 'FASHION',
    entertainment: 'ENTERTAINMENT',
    gadget: 'GADGET',
    bettermen: 'BETTER MEN',
} satisfies Record<string, string>;

type Category = keyof typeof categoryTitleMap;

const subcategoryTitleMaps: Record<Category, Record<string, string>> = {
    life: {
        food: '美食',
        wine: '微醺',
        outdoor: '戶外生活',
        design: '設計生活',
        lifestyleinsider: '五感十築',
        gogreen: 'GoGreen',
        special: '特別報導',
    },
    fashion: {
        'fashion-news': '新訊',
        shopping: '編輯推薦',
        guide: '穿搭指南',
        special: '特別報導',
    },
    entertainment: {
        movie: '電影',
        popculture: '娛樂',
        celebrities: '名人',
        girl: '美女',
        sports: '體育',
        special: '特別報導',
        // 奧斯卡 section links to /tag/the-oscars-奧斯卡金像獎, not used as a subcategory of this route for now; might support it in the future in a /tag route
    },
    gadget: {
        '3c': '3C',
        auto: '車',
        watch: '腕錶',
        special: '特別報導',
    },
    bettermen: {
        wellbeing: '保養健身',
        relationship: '感情關係',
        sex: '性愛',
        'one-shot': 'ONE-SHOT',
        special: '特別報導',
    },
};

const isCategory = (category: string): category is Category => Object.hasOwn(categoryTitleMap, category);

export const route: Route = {
    path: '/tw/:category/:subcategory?', // category required because https://www.gq.com.tw/feed/rss already exists
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/gq/tw/life/outdoor',
    parameters: {
        category: 'Category, e.g., life',
        subcategory: 'Subcategory, e.g., outdoor',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.gq.com.tw/:category/:subcategory?'],
            target: '/tw/:category/:subcategory?',
        },
    ],
    name: 'GQ台灣',
    maintainers: ['johan456789'],
    handler,
    description: 'GQ 台灣 最新內容，可選擇類別與子類別',
};

async function handler(ctx: Context): Promise<Data> {
    const category = ctx.req.param('category')!;
    const subcategory = ctx.req.param('subcategory') ?? '';

    if (!isCategory(category)) {
        throw new Error(`Unsupported category: ${category}`);
    }

    const allowedSubMap = subcategoryTitleMaps[category];
    if (subcategory && !Object.hasOwn(allowedSubMap, subcategory)) {
        throw new Error(`Unsupported subcategory: ${subcategory}`);
    }

    const listUrl = `${baseUrl}/${category}${subcategory ? '/' + subcategory : ''}`;
    const { items, headTitle } = await parseWebpage(listUrl);
    logger.debug(`[gq/tw] fetched ${items.length} items from ${listUrl}`);

    const categoryTitle = categoryTitleMap[category];
    const subcategoryTitle = subcategory ? allowedSubMap[subcategory] : undefined;
    const fallbackTitle = subcategory ? `${subcategoryTitle} | GQ Taiwan` : `${categoryTitle} | GQ Taiwan`;
    const title = headTitle || fallbackTitle;
    return {
        title,
        link: listUrl,
        item: items,
    };
}
interface PageParseResult {
    items: DataItem[];
    headTitle?: string;
}

type GqNode = {
    url: string;
    source?: {
        hed?: string;
    };
    dangerousHed?: string;
    dangerousDek?: string;
    pubDate?: string;
    image?: {
        sources?: {
            xxl?: { url?: string };
            lg?: { url?: string };
            sm?: { url?: string };
        };
    };
};

type PreloadedState = {
    transformed?: {
        'head.title'?: string;
        bundle?: {
            containers?: Array<{
                items?: GqNode[];
            }>;
        };
    };
};

async function parseWebpage(url: string): Promise<PageParseResult> {
    // www.gq.com.tw sits behind Cloudflare bot management, which rejects the default undici
    // handshake with a 403 managed challenge. Offering a TLSv1.3-only handshake passes most
    // requests, but the challenge is still served probabilistically, so include 403 in the
    // retried status codes.
    const html = await ofetch(url, {
        minVersion: 'TLSv1.3',
        retryStatusCodes: [400, 403, 408, 409, 425, 429, 500, 502, 503, 504],
    });
    const $ = load(html);

    const stateObj = extractPreloadedStateObject($);

    if (!stateObj?.transformed) {
        throw new Error(`Failed to extract preloaded state object from ${url}`);
    }

    const headTitle = stateObj.transformed['head.title'];

    const nodes = (stateObj.transformed.bundle?.containers ?? []).flatMap((container) => container.items ?? []).filter((node) => node?.url);

    const items: DataItem[] = nodes.map((node) => {
        const link = new URL(node.url, baseUrl).href;

        const title = node.source?.hed ?? node.dangerousHed ?? '';
        const pubDate = node.pubDate ? parseDate(node.pubDate) : undefined;

        const imgSources = node.image?.sources;
        const imgSrc = imgSources?.xxl?.url ?? imgSources?.lg?.url ?? imgSources?.sm?.url;
        const textDescription = node.dangerousDek;
        const description = imgSrc || textDescription ? renderDescription({ src: imgSrc, alt: title, text: textDescription }) : undefined;

        return {
            title,
            link,
            pubDate,
            description,
            image: imgSrc,
        };
    });

    logger.debug(`[gq/tw] parsed ${items.length} items from JSON state ${url}`);
    return { items, headTitle };
}

/**
 * Extract preloaded state object from HTML
 */
function extractPreloadedStateObject($: CheerioAPI): PreloadedState | null {
    const stateScriptText = $('script:contains("__PRELOADED_STATE__")').text();
    if (!stateScriptText) {
        logger.debug('[gq/tw] __PRELOADED_STATE__ script not found');
        return null;
    }

    const assignIndex = stateScriptText.indexOf('window.__PRELOADED_STATE__');
    const braceStart = stateScriptText.indexOf('{', assignIndex);
    const braceEnd = stateScriptText.lastIndexOf('}');
    if (braceStart === -1 || braceEnd === -1 || braceEnd <= braceStart) {
        logger.debug('[gq/tw] __PRELOADED_STATE__ json is malformed');
        return null;
    }

    const jsonText = stateScriptText.slice(braceStart, braceEnd + 1);
    return JSON.parse(jsonText);
}
