import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const BASE_URL = 'https://www.huijin-inv.cn';

/**
 * The client-side entrypoint to redirect to the post index of the latest year.
 */
const ENTRY_URL = `${BASE_URL}/huijin-inv/Corporate_History/index.shtml`;

async function handler(): Promise<Data> {
    const entryRes = await ofetch(ENTRY_URL);
    const $entry: CheerioAPI = load(entryRes);
    const $scripts = $entry('head script');
    let redirectPath: string | undefined;
    $scripts.each((_, el) => {
        const redirectScript = $entry(el).text();
        if (redirectScript === null) {
            return;
        }

        // Get the real index page by JS redirection href. The path may change.
        const match = redirectScript.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
        if (match) {
            redirectPath = match[1];
        }
    });
    if (!redirectPath) {
        throw new Error('Huijin did not provide the current news index redirect.');
    }
    const redirectURL = new URL(redirectPath, ENTRY_URL).href;
    const indexPage = await ofetch(redirectURL);
    const $: CheerioAPI = load(indexPage);
    const title = $('title').text()?.trim();
    const author = $('div.logo a').attr('title');
    const list: Array<DataItem & { link: string }> = $('div.infor-list-item')
        .toArray()
        .map((listItem) => {
            const item = $(listItem);
            const title = item.find('h1').text();
            const pubDate = `${item.find('span.year').text()}.${item.find('span.day').text()}`;
            const date = /^\d{4}\.\d{2}\.\d{2}$/.test(pubDate) ? parseDate(pubDate, 'YYYY.MM.DD', true) : undefined;
            const href = item.find('a').attr('href');
            if (!href) {
                throw new Error('Huijin returned a news item without an article URL.');
            }
            const link = new URL(href, redirectURL).href;
            const description = item.find('p').text();
            return {
                title,
                link,
                pubDate: date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined,
                description,
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $detail = load(response);
                const content = $detail('.infor-txt-l .infor-txt-con');
                content.children('span').first().remove();
                const description = content.html();
                if (!description?.trim()) {
                    throw new Error(`Huijin article content was not found at ${item.link}.`);
                }
                return { description };
            });
            return { ...item, description: detail.description };
        },
        { concurrency: 3 }
    );
    return {
        item: items,
        title,
        link: BASE_URL,
        description: `${author} - ${title}`,
        author,
        language: 'zh-CN',
    };
}

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/huijin-inv/news',
    parameters: {},
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
            source: ['www.huijin-inv.cn/'],
        },
    ],
    name: '资讯中心',
    maintainers: ['la3rence'],
    handler,
    description: '中央汇金投资有限责任公司 - 资讯中心',
};
