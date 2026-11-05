import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import { type Data, type DataItem, type Language, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 30);

    const baseUrl = 'http://mysql.taobao.org';
    const targetUrl: string = new URL('monthly/', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh') as Language;

    const monthlyItems: DataItem[] = await collectMonthlyItems($, $('h3 a.main').toArray(), baseUrl, limit, language);

    const items: DataItem[] = await pMap(
        monthlyItems.slice(0, limit),
        (item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(`${item.link}:publication-v2`, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h2').first().text() || item.title;
                const description = $$('div.content').html();
                const issue = $$('h1')
                    .text()
                    .match(/\d{4}\s*\/\s*\d{2}/)?.[0]
                    .replaceAll(/\s/g, '');
                const authorEls: Element[] = $$('div.block p').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.text().split(/:/).pop()?.trim() ?? '',
                        url: undefined,
                        avatar: undefined,
                    };
                });
                const processedItem: DataItem = {
                    title,
                    description,
                    category: issue ? [issue] : undefined,
                    author: authors,
                    content: {
                        html: description,
                        text: $$('div.content').text(),
                    },
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        },
        { concurrency: 3 }
    );

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        author: title,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/mysql/monthly',
    name: '数据库内核月报',
    url: 'mysql.taobao.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/taobao/mysql/monthly',
    parameters: undefined,
    description: undefined,
    categories: ['programming'],
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
            source: ['mysql.taobao.org/monthly/'],
            target: '/mysql/monthly',
        },
    ],
    view: ViewType.Articles,
};

async function collectMonthlyItems($: CheerioAPI, elements: Element[], baseUrl: string, limit: number, language: Language, index = 0, items: DataItem[] = []): Promise<DataItem[]> {
    if (index >= elements.length || items.length >= limit) {
        return items;
    }
    let href: string | undefined;
    while (index < elements.length && !href) {
        href = $(elements[index]).attr('href');
        if (!href) {
            index++;
        }
    }
    if (href) {
        const monthlyUrl = new URL(href, baseUrl).href;
        const monthlyResponse = await ofetch(monthlyUrl);
        const $$ = load(monthlyResponse);
        for (const el of $$('h3 a.main').toArray()) {
            const linkUrl = $$(el).attr('href');
            if (linkUrl) {
                items.push({ title: $$(el).text(), link: new URL(linkUrl, baseUrl).href, language });
            }
            if (items.length >= limit) {
                break;
            }
        }
    }
    return href ? collectMonthlyItems($, elements, baseUrl, limit, language, index + 1, items) : items;
}
