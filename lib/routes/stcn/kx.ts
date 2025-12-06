import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.stcn.com';
    const targetUrl: string = new URL('article/list/kx.html', baseUrl).href;
    const apiUrl: string = new URL('article/list.html', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);

    const response = await ofetch(apiUrl, {
        headers: {
            'x-requested-with': 'XMLHttpRequest',
        },
        query: {
            type: 'kx',
        },
    });

    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = response.data.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const description: string = item.content;
        const pubDate: number | string = item.time;
        const linkUrl: string | undefined = item.url;
        const categories: string[] = item.tags ? item.tags.map((c) => c.name) : [];
        const authors: DataItem['author'] = item.source;
        const image: string | undefined = item.share?.image;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
            link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
            category: categories,
            author: authors,
            content: {
                html: description,
                text: item.content ?? description,
            },
            image,
            banner: image,
            updated: updated ? parseDate(updated, 'X') : undefined,
            language,
        };

        return processedItem;
    });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('div.detail-title').text();
                    const description: string = $$('div.detail-content').html() ?? '';
                    const pubDateStr: string | undefined = $$('div.detail-info span').last().text().trim();
                    const categories: string[] = [...new Set([...(item.category as string[]), ...($$('meta[name="keywords"]').attr('content')?.split(/,/) ?? [])])];
                    const authors: DataItem['author'] = $$('div.detail-info span').first().text().split(/：/).pop();
                    const upDatedStr: string | undefined = pubDateStr;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        category: categories,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                        language,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.stcn-logo').attr('src'),
        author: $('meta[name="keywords"]').attr('content')?.split(/,/)[0],
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/article/list/kx',
    name: '快讯',
    url: 'www.stcn.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/stcn/article/list/kx',
    parameters: undefined,
    description: undefined,
    categories: ['finance'],
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
            source: ['www.stcn.com/article/list/kx.html'],
            target: '/article/list/kx',
        },
    ],
    view: ViewType.Articles,
};
