import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const handler = async (ctx: Context): Promise<Data> => {
    const { filter } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const baseUrl = 'https://diariofruticola.cl';
    const targetUrl: string = new URL(`filtro/${filter}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'es') as Language;

    let items: DataItem[] = $('div#printableArea a.text-dark')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.text();
            const linkUrl: string | undefined = $el.attr('href');

            const processedItem: DataItem = {
                title,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                language,
            };

            return processedItem;
        });

    items = (
        await pMap(
            items,
            (item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link!);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('h1.my-2').text();
                    const article = $$('div.ck-content').first();
                    const description = article.html();
                    const pubDateStr = $$('meta[property="article:published_time"]').attr('content');
                    const upDatedStr = $$('meta[property="article:modified_time"]').attr('content');

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        content: {
                            html: description,
                            text: article.text(),
                        },
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            },
            { concurrency: 3 }
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('img#logo').attr('src'),
        author: $('meta[name="keywords"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/filtro/:filter{.+}',
    name: 'Filtro',
    url: 'diariofruticola.cl',
    maintainers: ['nczitzk'],
    handler,
    example: '/diariofruticola/filtro/cerezas/71',
    parameters: {
        filter: {
            description: 'Filter',
        },
    },
    description: `::: tip
If you subscribe to [Cerezas](https://www.diariofruticola.cl/filtro/cerezas/71/)，where the URL is \`https://www.diariofruticola.cl/filtro/cerezas/71/\`, extract the path after \`/filtro/\`, which is \`cerezas/71\`, and use it as the parameter. Therefore, the route will be [\`/diariofruticola/filtro/cerezas/71\`](https://rsshub.app/diariofruticola/filtro/cerezas/71).
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
            source: ['diariofruticola.cl/filtro/:category/:id'],
            target: '/filtro/:category/:id',
        },
    ],
    view: ViewType.Articles,
};
