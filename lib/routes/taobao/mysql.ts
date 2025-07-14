import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'http://mysql.taobao.org';
    const targetUrl: string = new URL('monthly/', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];
    let count = 0;

    items = await Promise.all(
        $('h3 a.main')
            .toArray()
            .map(async (monthlyEl): Promise<Element[] | undefined> => {
                const $monthlyEl: Cheerio<Element> = $(monthlyEl);

                const monthlyUrl: string | undefined = $monthlyEl.attr('href') ? new URL($monthlyEl.attr('href') as string, baseUrl).href : undefined;

                if (!monthlyUrl) {
                    return undefined;
                }

                const monthlyResponse = await ofetch(monthlyUrl);

                const $$: CheerioAPI = load(monthlyResponse);

                return $$('h3 a.main')
                    .toArray()
                    .map((el): Element => {
                        if (count < limit) {
                            const $$el: Cheerio<Element> = $$(el);

                            const title: string = $$el.text();
                            const linkUrl: string | undefined = $$el.attr('href');
                            const pubDateStr: string | undefined = linkUrl?.split(/monthly\//).pop();
                            const upDatedStr: string | undefined = pubDateStr;

                            const processedItem: DataItem = {
                                title,
                                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                                language,
                            };
                            count++;
                            return processedItem;
                        }
                        return undefined;
                    })
                    .filter(Boolean);
            })
    );

    items = await Promise.all(
        items
            .filter(Boolean)
            .flat()
            .slice(0, limit)
            .map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('h2').first().text()?.trim() || item.title;
                    const description: string | undefined = $$('div.content').html() ?? undefined;
                    const pubDateStr: string | undefined = item.link.split(/monthly\//).pop();
                    const authorEls: Element[] = $$('div.block p').toArray();
                    const authors: DataItem['author'] = authorEls.map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl);

                        return {
                            name: $$authorEl.text().split(/:/).pop()?.trim() ?? '',
                            url: undefined,
                            avatar: undefined,
                        };
                    });
                    const upDatedStr: string | undefined = pubDateStr;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
    );

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
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
