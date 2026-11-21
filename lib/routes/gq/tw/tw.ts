import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

import { renderDescription } from './templates/description';

const baseUrl = 'https://www.gq.com.tw';

const categoryTitleMap: Record<string, string> = {
    life: 'LIFE',
    fashion: 'FASHION',
    entertainment: 'ENTERTAINMENT',
    gadget: 'GADGET',
    bettermen: 'BETTER MEN',
};

const subcategoryTitleMaps: Record<string, Record<string, string>> = {
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
        requirePuppeteer: true,
        antiCrawler: true,
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

    if (!Object.hasOwn(categoryTitleMap, category)) {
        throw new Error(`Unsupported category: ${category}`);
    }

    if (subcategory) {
        const allowedSubMap = subcategoryTitleMaps[category] ?? {};
        if (!Object.hasOwn(allowedSubMap, subcategory)) {
            throw new Error(`Unsupported subcategory: ${subcategory}`);
        }
    }

    const listUrl = `${baseUrl}/${category}${subcategory ? '/' + subcategory : ''}`;
    const { items, headTitle } = await parseWebpage(listUrl);
    logger.debug(`[gq/tw] fetched ${items.length} items from ${listUrl}`);

    const categoryTitle = categoryTitleMap[category];
    const subcategoryTitle = subcategory ? subcategoryTitleMaps[category][subcategory] : undefined;
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

/**
 * Fetch the page HTML with a real browser.
 * gq.com.tw sits behind a Cloudflare managed challenge that rejects non-browser clients with 403,
 * so the page has to be loaded in Chromium and the challenge allowed to clear first.
 */
async function fetchPageHtml(url: string): Promise<string> {
    const context = await playwright();
    const page = await context.newPage();
    try {
        // only allow the document request, abort everything else to avoid wasting resources
        await page.route('**/*', (route) => {
            if (route.request().resourceType() === 'document') {
                void route.continue();
            } else {
                void route.abort();
            }
        });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // the Cloudflare challenge page does not contain the preloaded state; wait until the real page is served
        await page.waitForFunction(() => document.documentElement.getHTML().includes('__PRELOADED_STATE__'), null, { timeout: 30000 });
        return await page.content();
    } finally {
        await page.close();
        await context.close();
    }
}

async function parseWebpage(url: string): Promise<PageParseResult> {
    const html = await fetchPageHtml(url);
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
