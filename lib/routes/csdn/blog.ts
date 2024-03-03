// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import rssParser from '@/utils/rss-parser';

export default async (ctx) => {
    const user = ctx.req.param('user');

    const rootUrl = 'https://blog.csdn.net';
    const blogUrl = `${rootUrl}/${user}`;
    const rssUrl = blogUrl + '/rss/list';

    const feed = await rssParser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);

                const description = $('#content_views').html();

                return {
                    ...item,
                    description,
                };
            })
        )
    );

    ctx.set('data', {
        ...feed,
        title: `${feed.title} - CSDN博客`,
        item: items,
    });
};
