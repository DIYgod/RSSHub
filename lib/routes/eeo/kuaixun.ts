import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 50);

    const baseUrl = 'https://www.eeo.com.cn';
    const apiUrl = 'https://app.eeo.com.cn';
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
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = response.data.slice(0, limit).map((item): DataItem => {
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

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
            link: linkUrl,
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description ? load(description).text() : undefined,
            },
            image,
            banner: image,
            language,
        };

        return processedItem;
    });

    items = await pMap(
        items,
        (item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1').first().text() || $$('h2.title').text() || item.title;
                const articleHtml = $$('div.xx_boxsing, div#mainBody').html();
                const description: string | undefined = articleHtml ? renderDescription({ description: articleHtml }) : (item.description ?? undefined);
                const pubDateStr: string | undefined = $$('h1').next().find('span').first().text() || $$('div.from').text();
                const authors: DataItem['author'] = $$('h1').next().contents().first().text() || $$('span.showMoreAuthor').text() || item.author;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
                    author: authors,
                    content: {
                        html: description,
                        text: articleHtml ? $$('div.xx_boxsing, div#mainBody').text() : item.content?.text,
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

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
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
