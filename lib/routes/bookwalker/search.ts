import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { filter = 'order=sell_desc' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '24', 10);

    const baseUrl: string = 'https://www.bookwalker.com.tw';
    const targetUrl: string = new URL(`search?${filter}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-TW';

    const items: DataItem[] = $('div.bwbook_package')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const name: string = $el.find('h4.bookname').text();
            const price: string = $el.find('h5.bprice').text();
            const authorStr: string = $el.find('h5.booknamesub').text().trim();

            const title: string = `${name} - ${authorStr} ${price}`;
            const image: string | undefined = $el
                .find('img')
                .attr('data-src')
                ?.replace(/_\d+(\.\w+)$/, '$1');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: name,
                          },
                      ]
                    : undefined,
            });
            const linkUrl: string | undefined = $el.find('div.bwbookitem a').attr('href');
            const authors: DataItem['author'] = authorStr.split(/,/).map((a) => ({
                name: a,
            }));

            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
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
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/search/:filter?',
    name: '搜尋',
    url: 'www.bookwalker.com.tw',
    maintainers: ['nczitzk'],
    handler,
    example: '/bookwalker/search/order=sell_desc&s=34',
    parameters: {
        filter: {
            description: '过滤器，默认为 `order=sell_desc`，即依發售日新至舊排序',
        },
    },
    description: `:::tip
订阅 [依發售日新至舊排序的文學小說](https://www.bookwalker.com.tw/search?order=sell_desc&s=34)，其源网址为 \`https://www.bookwalker.com.tw/search?order=sell_desc&s=34\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/bookwalker/search/order=sell_desc&s=34\`](https://rsshub.app/bookwalker/search/order=sell_desc&s=34)。
:::
`,
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
            source: ['www.bookwalker.com.tw/search'],
            target: '/bookwalker/search',
        },
    ],
    view: ViewType.Articles,
};
