import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.python.org';
    const targetUrl: string = new URL('downloads', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('div.active-release-list-widget ol.list-row-container li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('span.release-version').text();
            const pubDateStr: string | undefined = $el
                .find('span.release-start')
                .text()
                ?.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
            const linkUrl: string | undefined = $el.find('span.release-pep a').attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
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

                const title: string = $$('h1.page-title').text();
                const description: string | undefined = $$('section#pep-content').html();
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');

                const processedItem: DataItem = {
                    title,
                    description,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
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
        title: $('div.active-release-list-widget h2.widget-title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/release',
    name: 'Active Python Releases',
    url: 'www.python.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/python/release',
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
            source: ['www.python.org', 'www.python.org/downloads'],
            target: '/release',
        },
    ],
    view: ViewType.Articles,
};
