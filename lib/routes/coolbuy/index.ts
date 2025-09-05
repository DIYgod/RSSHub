import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const baseUrl: string = 'https://coolbuy.com';
    const imageBaseUrl: string = 'https://mcache.ifanr.cn';
    const apiUrl: string = new URL('api/v1.4/product_preview', baseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            order_by: '-id',
            limit,
            page: 0,
            offset: 0,
        },
    });

    const targetResponse = await ofetch(baseUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh';

    const items: DataItem[] = response.objects.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const image: string | undefined = item.cover_image?.split(/\?/)?.[0];
        const banner: string | undefined = item.display_image?.split(/\?/)?.[0];

        const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
            summary: item.summary,
            price: item.price,
            original_price: item.original_price,
            highest_price: item.highest_price,
            highest_original_price: item.highest_original_price,
            images: [banner, image].filter(Boolean).map((image) => ({
                src: image,
                alt: title,
            })),
        });

        const linkUrl: string | undefined = item.visit_url;
        const guid: string = `coolbuy-${item.id}#${item.price}`;

        const processedItem: DataItem = {
            title,
            description,
            link: linkUrl ?? new URL(item.id, baseUrl).href,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            language,
        };

        return processedItem;
    });

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: baseUrl,
        item: items,
        allowEmpty: true,
        image: new URL('static/coolbuy/packages/dongguan/dist/images/97be46f6.png', imageBaseUrl).href,
        language,
        id: baseUrl,
    };
};

export const route: Route = {
    path: '/',
    name: '产品',
    url: 'coolbuy.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/coolbuy',
    parameters: undefined,
    description: undefined,
    categories: ['shopping'],
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
            source: ['coolbuy.com'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
