import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { filter } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://diariofruticola.cl';
    const targetUrl: string = new URL(`filtro/${filter}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'es';

    let items: DataItem[] = [];

    items = $('div#printableArea a.text-dark')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
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
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('h1.my-2').text();
                    const description: string | undefined = $$('div.ck-content').html() ?? '';
                    const pubDateStr: string | undefined = detailResponse.match(/"datePublished":\s"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/)?.[1] ?? undefined;
                    const upDatedStr: string | undefined = detailResponse.match(/"dateModified":\s"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/)?.[1] ?? undefined;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), -3) : item.pubDate,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? timezone(parseDate(upDatedStr), -3) : item.updated,
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
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
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
If you subscribe to [Cerezas](https://www.diariofruticola.cl/filtro/cerezas/71/)，where the URL is \`https://www.diariofruticola.cl/filtro/cerezas/71/\`, extract the part \`https://diariofruticola.cl/filtro\` to the end, which is \`/\`, and use it as the parameter to fill in. Therefore, the route will be [\`/diariofruticola/filtro/cerezas/71\`](https://rsshub.app/diariofruticola/filtro/cerezas/71).
:::
`,
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
            source: ['diariofruticola.cl/filtro/:filter'],
            target: (params) => {
                const filter: string = params.filter;

                return `/diariofruticola/filtro${filter ? `/${filter}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
