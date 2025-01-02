import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import parser from '@/utils/rss-parser';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/:domain/:category?',
    name: 'Unknown',
    maintainers: [],
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
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                $('.entry img').each((_, img) => {
                    if (img.attribs['data-original'] || img.attribs['data-src']) {
                        img.attribs.src = img.attribs['data-original'] || img.attribs['data-src'];
                        delete img.attribs['data-original'];
                        delete img.attribs['data-src'];
                    }
                });

                item.author = $('.author_name').text().trim();
                item.category = $('.tags a')
                    .toArray()
                    .map((tag) => $(tag).text());
                $('.social_block, .tags').remove();
                item.description = $('.entry').html();

                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;
                return item;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        image: domain === 'news' ? `${baseUrl}/blogico.ico` : `${baseUrl}/favicon.ico`,
        description: feed.description,
        item: items,
    };
}
