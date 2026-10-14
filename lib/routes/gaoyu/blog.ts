import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import destr from 'destr';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 20);

    const baseUrl = 'https://www.gaoyu.me';
    const targetUrl: string = new URL('blog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh-cn') as Language;

    const authors: DataItem['author'] = [
        {
            name: 'Yu Gao',
            url: baseUrl,
            avatar: undefined,
        },
    ];

    let items: DataItem[] = $('a.flex-col')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('p.text-neutral-900').text();
            const description: string | undefined = renderDescription({
                intro: $el.find('p.text-neutral-600').last().html() ?? undefined,
            });
            const pubDateStr: string | undefined = $el.find('p.text-neutral-600').first().text();
            const linkUrl: string | undefined = $el.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
                content: {
                    html: description,
                },
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        async (item) => {
            if (!item.link) {
                return item;
            }

            const detail = await cache.tryGet(`${item.link}#article-detail`, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1.title').text();
                const description = renderDescription({
                    description: $$('article.prose').html() ?? undefined,
                });
                const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');
                const articleMetadata = $$('script[type="application/ld+json"]')
                    .toArray()
                    .map((el) => destr<Record<string, unknown>>($$(el).text()))
                    .find((metadata) => metadata?.['@type'] === 'BlogPosting');
                const updatedStr = articleMetadata?.dateModified;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                    image,
                    banner: image,
                    updated: typeof updatedStr === 'string' && updatedStr ? parseDate(updatedStr) : undefined,
                };

                return processedItem;
            });
            const description = (item.description ?? '') + (detail.description ?? '');

            return {
                ...item,
                ...detail,
                pubDate: detail.pubDate ?? item.pubDate,
                description,
                content: {
                    html: description,
                },
            };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'www.gaoyu.me',
    maintainers: ['nczitzk'],
    handler,
    example: '/gaoyu/blog',
    parameters: undefined,
    description: undefined,
    categories: ['blog'],
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
            source: ['www.gaoyu.me/blog'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
};
