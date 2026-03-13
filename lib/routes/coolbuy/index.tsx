import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const baseUrl = 'https://coolbuy.com';
    const imageBaseUrl = 'https://mcache.ifanr.cn';
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

        const images = [banner, image].filter(Boolean).map((image) => ({
            src: image,
            alt: title,
        }));
        const description: string | undefined = renderToString(
            <>
                <table>
                    <tbody>
                        {item.summary ? (
                            <tr>
                                <th>简介</th>
                                <td>{item.summary}</td>
                            </tr>
                        ) : null}
                        {item.price ? (
                            <tr>
                                <th>价格</th>
                                <td>{item.price}</td>
                            </tr>
                        ) : null}
                        {item.original_price ? (
                            <tr>
                                <th>原价</th>
                                <td>{item.original_price}</td>
                            </tr>
                        ) : null}
                        {item.highest_price ? (
                            <tr>
                                <th>价格（最高）</th>
                                <td>{item.highest_price}</td>
                            </tr>
                        ) : null}
                        {item.highest_original_price ? (
                            <tr>
                                <th>原价（最高）</th>
                                <td>{item.highest_original_price}</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
                {images?.length ? images.map((image) => (image?.src ? <figure>{image.alt ? <img src={image.src} alt={image.alt} /> : <img src={image.src} />}</figure> : null)) : null}
            </>
        );

        const linkUrl: string | undefined = item.visit_url;
        const guid = `coolbuy-${item.id}#${item.price}`;

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
