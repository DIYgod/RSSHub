import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const baseUrl: string = 'https://www.eeo.com.cn';
    const apiUrl: string = 'https://app.eeo.com.cn';
    const targetUrl: string = new URL('kuaixun/', baseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            app: 'article',
            controller: 'index',
            action: 'getMoreArticle',
            catid: 3690,
            uuid: 'b048c7211db949eeb7443cd5b9b3bfe3',
            page: 1,
            pageSize: limit,
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = response.data.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const description: string | undefined = renderDescription({
            intro: item.description,
            description: item.content,
        });
        const pubDate: number | string = item.published;
        const linkUrl: string | undefined = item.url;
        const categories: string[] = [item.catname].filter(Boolean);
        const authors: DataItem['author'] = item.author;
        const guid: string = item.contentid ? `eeo-${item.contentid}` : '';
        const image: string | undefined = item.thumb;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
            link: linkUrl,
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            updated: updated ? timezone(parseDate(updated), +8) : undefined,
            language,
        };

        return processedItem;
    });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1').first().text() || $$('h2.title').text() || item.title;
                const description: string | undefined =
                    item.description +
                    renderDescription({
                        description: $$('div.xx_boxsing, div#mainBody').html() || undefined,
                    });
                const pubDateStr: string | undefined = $$('h1').next().find('span').first().text() || $$('div.from').text();
                const authors: DataItem['author'] = $$('h1').next().contents().first().text() || $$('span.showMoreAuthor').text() || item.author;
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
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
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.logo img').attr('src'),
        author: $('meta[name="author"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/kuaixun',
    name: '快讯',
    url: 'www.eeo.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/eeo/kuaixun',
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
            source: ['www.eeo.com.cn/kuaixun/'],
            target: '/kuaixun',
        },
    ],
    view: ViewType.Articles,
};
