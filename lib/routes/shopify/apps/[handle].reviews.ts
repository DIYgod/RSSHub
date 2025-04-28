import { Data, DataItem, Route } from '@/types';
import { Context } from 'hono';
import { baseURL } from './const';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/apps/:handle/reviews/:page?',
    example: '/shopify/apps/flow/reviews',
    parameters: { handle: '例如一个 App 的链接 https://apps.shopify.com/flow，其中 flow 就是指的是 handle' },
    name: 'App reviews',
    maintainers: ['PrintNow'],
    handler,
    radar: [
        {
            source: ['apps.shopify.com/:handle'],
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { handle = '', page = '1' } = ctx.req.param();
    const response = await got.get(`${baseURL}/${handle}/reviews`, {
        searchParams: {
            sort_by: 'newest',
            page,
        },
        headers: {
            accept: 'text/html, application/xhtml+xml',
            'accept-language': 'en-US;q=0.9',
            referer: baseURL,
            dnt: '1',
        },
    });

    const htmlContent = response.data;
    const $ = load(htmlContent);

    const items = $('div[data-merchant-review]')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const reviewID = $item.attr('data-review-content-id');

            const $review1 = $item.find('div:nth-child(1)');
            const $review2 = $item.find('div:nth-child(2)');

            const description = $item.find('div[data-truncate-review] div[data-truncate-content-copy] p').html() || '';
            const author = $review2.find('div.tw-text-fg-primary').text().trim();

            const result: DataItem = {
                guid: reviewID,
                title: description,
                author,
                pubDate: new Date($review1.find('div[aria-label] + div').text().trim()),

                // 评论内容
                description,

                _extra: {
                    ratting_value: Number($review1.find('div[role="img"]').attr('aria-label')?.slice(0, 1)),
                    location: $review2.find('div.tw-text-fg-primary + div').text().trim(),
                    author,
                },
            };

            return result;
        });

    return {
        title: `Reviews handle:${handle} page:${page} – Shopify App Store`,
        link: `${baseURL}/${handle}/reviews`,
        allowEmpty: true,
        language: 'en-us',
        item: items,
    };
}
