import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { baseURL } from './const';

export const route: Route = {
    path: '/apps/:handle/reviews/:page?',
    example: '/shopify/apps/flow/reviews',
    parameters: {
        handle: '例如一个 App 的链接 https://apps.shopify.com/flow，其中 flow 就是指的是 handle',
        page: '兼容旧链接；始终返回最新评论第一页',
    },
    name: 'App reviews',
    maintainers: ['PrintNow'],
    handler,
    radar: [
        {
            source: ['apps.shopify.com/:handle/reviews'],
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { handle = '' } = ctx.req.param();
    const page = '1';
    const response = await got.get(`${baseURL}/${handle}/reviews`, {
        searchParams: {
            sort_by: 'newest',
            page,
        },
        headers: {
            accept: 'text/html, application/xhtml+xml',
            'accept-language': 'en-US;q=0.9',
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
            const shareLink = $item.find('[data-review-share-link]').attr('data-review-share-link');

            const $review1 = $item.find('div:nth-child(1)');
            const $review2 = $item.find('div:nth-child(2)');

            const description = $item.find('div[data-truncate-review] div[data-truncate-content-copy] p').html() || '';
            const author = $review2.find('div.tw-text-fg-primary').text().trim();

            const rating = Number($review1.find('div[role="img"]').attr('aria-label')?.slice(0, 1));
            const result: DataItem = {
                guid: reviewID,
                link: shareLink ? new URL(shareLink, baseURL).href : undefined,
                title: description || `${author} (${rating}/5)`,
                author,
                pubDate: timezone(parseDate($review1.find('div[aria-label] + div').text().trim(), 'MMMM D, YYYY'), 0),

                // 评论内容
                description,

                _extra: {
                    ratting_value: rating,
                    location: $review2.find('div.tw-text-fg-primary + div').text(),
                    author,
                },
            };

            return result;
        });

    return {
        title: `Reviews handle:${handle} page:${page} – Shopify App Store`,
        link: `${baseURL}/${handle}/reviews`,
        language: 'en-us',
        item: items,
    };
}
