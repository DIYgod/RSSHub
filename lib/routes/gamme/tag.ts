import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/:domain/tag/:tag',
    categories: ['new-media'],
    example: '/gamme/news/tag/歐派',
    parameters: {
        domain: '網站，`news` 為宅宅新聞，`sexynews` 為西斯新聞',
        tag: '標籤，可在 URL 找到',
    },
    name: '標籤',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { domain = 'news', tag } = ctx.req.param();
    if (!isValidHost(domain)) {
        throw new InvalidParameterError('Invalid domain');
    }
    const baseUrl = `https://${domain}.gamme.com.tw`;
    const pageUrl = `${baseUrl}/tag/${tag}`;

    const { data } = await got(pageUrl);
    const $ = load(data);

    const list = $('#category_new li a, .List-4 h3 a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.attr('title') || $item.text(),
                link: $item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
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

                item.author = $('.author_name').text().trim();
                item.category = $('.tags a')
                    .toArray()
                    .map((tag) => $(tag).text());
                $('.social_block, .tags').remove();
                item.pubDate = parseDate($('.postDate').attr('content')!);
                item.description = $('.entry').html();

                return item;
            })
        )
    );

    return {
        title: `${tag} | ${domain === 'news' ? '宅宅新聞' : '西斯新聞'}`,
        description: $('meta[name=description]').attr('content'),
        link: pageUrl,
        image: domain === 'news' ? `${baseUrl}/blogico.ico` : `${baseUrl}/favicon.ico`,
        item: items,
    };
}
