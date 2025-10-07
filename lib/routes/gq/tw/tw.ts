import { type Data, type DataItem, type Route } from '@/types';
import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';

import { load } from 'cheerio';
import path from 'node:path';
import type { Context } from 'hono';
import { JSONPath } from 'jsonpath-plus';

const baseUrl = 'https://www.gq.com.tw';

const categoryTitleMap: Record<string, string> = {
    life: 'Life',
    fashion: 'Fashion',
    entertainment: 'Entertainment',
    gadget: 'Gadget',
    bettermen: 'Better Men',
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
        // 奧斯卡導向 tag 頁，不作為此路由的子分類
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
    example: '/gq/tw/life/outdoor',
    parameters: {
        category: 'Category, e.g., life',
        subcategory: 'Subcategory, e.g., outdoor',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gq.com.tw/:category/:subcategory?'],
            target: '/tw/:category/:subcategory?',
        },
    ],
    name: 'GQ台灣',
    maintainers: ['johan456789'],
    handler,
    description: 'GQ台灣 最新內容，可選擇類別與子類別',
};

async function handler(ctx: Context): Promise<Data> {
    const category = ctx.req.param('category') ?? '';
    const subcategory = ctx.req.param('subcategory') ?? '';
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '21', 10);

    if (!category || !(category in categoryTitleMap)) {
        throw new Error(`Unsupported category: ${category}`);
    }

    if (subcategory) {
        const allowedSubMap = subcategoryTitleMaps[category] ?? {};
        if (!(subcategory in allowedSubMap)) {
            throw new Error(`Unsupported subcategory: ${subcategory}`);
        }
    }

    const listUrl = `${baseUrl}/${category}${subcategory ? '/' + subcategory : ''}`;
    const items = await parseWebpage(listUrl);
    logger.info(`[gq/tw] fetched ${items.length} items from ${listUrl}`);

    const categoryTitle = categoryTitleMap[category];
    const subcategoryTitle = subcategory ? subcategoryTitleMaps[category][subcategory] : undefined;
    const title = subcategory ? `GQ台灣 - ${categoryTitle}/${subcategoryTitle}` : `GQ台灣 - ${categoryTitle}`;
    return {
        title,
        link: listUrl,
        item: items.slice(0, limit),
    };
}

async function parseWebpage(url: string): Promise<DataItem[]> {
    const html = await ofetch(url);
    const $ = load(html);
    const containers = $('div[class^="SummaryCollectionGridItems"]');
    const wrappers = containers.find('div[class^="SummaryItemWrapper"]');

    const urlMetaMap = buildUrlMetaMap(extractPreloadedStateObject($), baseUrl);

    const items = wrappers
        .toArray()
        .map((el) => {
            const $el = $(el);

            const linkEl = $el.find('div[class^="SummaryItemContent"] a').first();
            const linkPath = linkEl.attr('href')?.trim();
            if (!linkPath) {
                return null;
            }
            const link = linkPath.startsWith('http') ? linkPath : new URL(linkPath, baseUrl).toString();

            const imgEl = $el.find('div[class^="SummaryItemAssetContainer"] img').first();
            const imgSrc = imgEl.attr('src')?.trim() || imgEl.attr('data-src')?.trim() || '';

            const title = $el
                .find('div[class^="SummaryItemContent"] a > h2')
                .text()
                .trim();

            const meta = urlMetaMap.get(link) ?? urlMetaMap.get(decodeURI(link));
            const pubDateText = meta?.pubDate;
            const timeEl = $el.find('div[class^="SummaryItemBylineWrapper"] > time');
            const timeText = timeEl.text().trim();
            const pubDate = pubDateText ? parseDate(pubDateText) : (timeText ? parseDate(timeText, 'YYYY年M月D日') : undefined);

            const textDescription = meta?.description;
            const description = Boolean(imgSrc) || Boolean(textDescription)
                ? art(path.join(__dirname, 'templates/description.art'), { src: imgSrc || undefined, alt: title, text: textDescription })
                : undefined;

            return {
                title,
                link,
                pubDate,
                description,
                image: imgSrc || undefined,
            } as DataItem;
        })
        .filter(Boolean) as DataItem[];

    logger.info(`[gq/tw] parsed ${items.length} items from list page ${url}`);

    return items;
}

function extractPreloadedStateObject($: ReturnType<typeof load>): any | null {
    const stateScriptText = $('script').filter((_, el) => $(el).text().includes('__PRELOADED_STATE__')).text();
    if (!stateScriptText) {
        logger.info('[gq/tw] __PRELOADED_STATE__ script not found');
        return null;
    }

    const assignIndex = stateScriptText.indexOf('window.__PRELOADED_STATE__');
    const braceStart = stateScriptText.indexOf('{', assignIndex);
    const braceEnd = stateScriptText.lastIndexOf('}');
    if (braceStart === -1 || braceEnd === -1 || braceEnd <= braceStart) {
        return null;
    }

    const jsonText = stateScriptText.slice(braceStart, braceEnd + 1);
    return JSON.parse(jsonText);
}
interface UrlMeta {
    pubDate?: string;
    description?: string;
}

function buildUrlMetaMap(stateObj: any, baseUrl: string): Map<string, UrlMeta> {
    if (!stateObj) {
        return new Map<string, UrlMeta>();
    }

    const items = JSONPath({
        path: '$.transformed.bundle.containers[*].items[*]',
        json: stateObj,
    }) as any[];

    const entries: Array<[string, UrlMeta]> = items
        .filter((node: any) => node && node.url)
        .map((node: any) => {
            const urlPath = String(node.url).replaceAll(String.raw`\u002F`, "/");
            const absoluteUrl = new URL(urlPath, baseUrl).toString();
            const meta: UrlMeta = {
                pubDate: node.pubDate ? String(node.pubDate) : undefined,
                description: node.dangerousDek ? String(node.dangerousDek) : undefined,
            };
            return [absoluteUrl, meta];
        });

    return new Map<string, UrlMeta>(entries);
}
