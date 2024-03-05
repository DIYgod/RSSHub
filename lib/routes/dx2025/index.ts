// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const type = ctx.req.param('type') || '';
    const category = ctx.req.param('category') || '';

    const rootUrl = 'https://www.dx2025.com';
    const currentUrl = `${rootUrl}${type === '' ? '' : `/archives/${type === 'tag' ? `tag${category === '' ? '' : `/${category}`}` : `category/${type}${category === '' ? '' : `/${category}`}`}`}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.entry-title a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.author = content('.entry-author-name').text();
                item.description = content('.bpp-post-content, .entry-content').html();
                item.pubDate = new Date(content('.entry-date').attr('datetime')).toUTCString();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
