import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { filter } = ctx.req.param();
    const limit = getRouteLimit(ctx, 10);

    const baseUrl = 'https://www.costar.com';
    const targetUrl: string = new URL(`products/benchmark/resources/press-releases${filter ? `?${filter}` : ''}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('div.views-row article')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a.coh-link').first();

            const title: string = $aEl.text();
            const description = $el.find('div.coh-container').eq(4).html();
            const pubDateStr: string | undefined = $el.find('div.coh-container').eq(3).text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('div.coh-style-tags a').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr, 'DD MMMM YYYY'), 0) : undefined,
                link: linkUrl,
                category: categories,
                content: {
                    html: description,
                    text: $('<div>')
                        .html(description ?? '')
                        .text(),
                },
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
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1.coh-heading').text();
                const description: string | null | undefined = $$('div.coh-body').html() ?? item.description;
                const pubDateStr: string | undefined = detailResponse.match(/"datePublished": "(.*?)",/)?.[1];
                const upDatedStr: string | undefined = detailResponse.match(/"dateModified": "(.*?)",/)?.[1];

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    content: {
                        html: description,
                        text: $$('<div>')
                            .html(description ?? '')
                            .text(),
                    },
                    updated: upDatedStr ? parseDate(upDatedStr) : undefined,
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
        description: $('meta[property="og:title"]').attr('content'),
        link: targetUrl,
        item: items,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/press-releases/:filter{.+}?',
    name: 'Press Releases',
    url: 'www.costar.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/costar/press-releases',
    parameters: {
        filter: {
            description: 'Filter',
        },
    },
    description: `::: tip
To subscribe to [Press Releases - Asia Pacific - Preliminary](https://www.costar.com/products/benchmark/resources/press-releases?region=406\\&tag=581), where the source URL is \`https://www.costar.com/products/benchmark/resources/press-releases?region=406&tag=581\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/costar/press-releases/region=406&tag=581\`](https://rsshub.app/costar/press-releases/region=406\\&tag=581).
:::`,
    categories: ['new-media'],
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
            source: ['www.costar.com/', 'www.costar.com/products/benchmark/resources/press-releases'],
            target: '/press-releases',
        },
    ],
    view: ViewType.Articles,
};
