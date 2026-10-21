import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/:domain/:category?',
    categories: ['new-media'],
    example: '/gamme/news',
    parameters: {
        domain: '網站，`news` 為宅宅新聞，`sexynews` 為西斯新聞',
        category: '分類名，可在 URL 找到，預設為全部',
    },
    name: '分類',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { domain = 'news', category } = ctx.req.param();
    if (!isValidHost(domain)) {
        throw new InvalidParameterError('Invalid domain');
    }
    const baseUrl = `https://${domain}.gamme.com.tw`;
    const feed = await parser.parseURL(`${baseUrl + (category ? `/category/${category}` : '')}/feed`);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const detail = await cache.tryGet(`${item.link}#gamme-category-detail`, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                $('.entry img').each((_, img) => {
                    if (!(img.attribs['data-original'] || img.attribs['data-src'])) {
                        return;
                    }

                    img.attribs.src = img.attribs['data-original'] || img.attribs['data-src'];
                    delete img.attribs['data-original'];
                    delete img.attribs['data-src'];
                });

                const author = $('.author_name').text().trim();
                const category = $('.tags a')
                    .toArray()
                    .map((tag) => $(tag).text());
                $('.social_block, .tags').remove();
                return { author, category, description: $('.entry').html() };
            });
            const result = { ...item, ...detail };
            delete result.content;
            delete result.contentSnippet;
            delete result.isoDate;
            return {
                ...result,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            };
        })
    );

    return {
        title: feed.title!,
        link: feed.link,
        image: domain === 'news' ? `${baseUrl}/blogico.ico` : `${baseUrl}/favicon.ico`,
        description: feed.description,
        item: items as DataItem[],
    };
}
