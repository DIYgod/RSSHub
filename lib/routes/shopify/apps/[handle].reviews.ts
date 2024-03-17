import { Data, DataItem, Route } from '@/types';
import { Context } from 'hono';
import { baseURL } from './const';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/apps/:handle/reviews/:page?',
    example: '/shopify/apps/flow/reviews',
    parameters: { handle: '例如一个 App 的链接 https://apps.shopify.com/flow，其中 flow 就是指的是 handle' },
    name: 'Shopify App reviews',
    maintainers: ['PrintNow'],
    handler,
};

async function handler(ctx?: Context): Promise<Data> {
    if (!ctx) {
        throw new Error('未传入 ctx');
    }

    const { handle = '', page = '1' } = ctx.req.param();
    const response = got.get(`${baseURL}/${handle}/reviews`, {
        searchParams: {
            sort_by: 'newest',
            page,
        },
        responseType: 'text',
        headers: {
            'accept': 'text/html, application/xhtml+xml',
            'accept-language': 'en-US;q=0.9',
            'referer': baseURL,
            'dnt': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
    });

    const htmlContent = await response.text();
    const $ = load(htmlContent);

    const items = $(`div[data-merchant-review]`)
        .map((index, item) => {
            const $item = $(item);

            const reviewID = $item.attr('data-review-content-id');

            const $review1 = $item.find(`div:nth-child(1)`);
            const $review2 = $item.find(`div:nth-child(2)`);

            const description = $item.find(`div[data-truncate-review] div[data-truncate-content-copy] p`).html() || '';
            const author = $review2.find(`div.tw-text-fg-primary`).text().trim();

            const result: DataItem = {
                guid: reviewID,
                title: description,
                author,
                pubDate: new Date($review1.find(`div[aria-label] + div`).text().trim()),

                // 评论内容
                description,

                _extra: {
                    ratting_value: Number(
                        $review1.find(`div[role="img"]`).attr(`aria-label`)?.substring(0, 1),
                    ),
                    location: $review2.find(`div.tw-text-fg-primary + div`).text().trim(),
                    author,
                },
            };

            return result;
        })
        .toArray();

    return {
        title: `Reviews handle:${handle} page:${page} – Shopify App Store`,
        link: `${baseURL}/${handle}/reviews`,
        allowEmpty: true,
        language: `en-US`,
        item: items,
    };
}
