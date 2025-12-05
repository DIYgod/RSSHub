import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import rssParser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog/:user',
    categories: ['blog'],
    example: '/csdn/blog/csdngeeknews',
    parameters: { user: '`user` is the username of a CSDN blog which can be found in the url of the home page' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['blog.csdn.net/:user'],
        },
    ],
    name: 'User Feed',
    maintainers: ['Jkker'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    const rootUrl = 'https://rss.csdn.net';
    const blogUrl = `${rootUrl}/${user}`;
    const rssUrl = blogUrl + '/rss/map';

    const feed = await rssParser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
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
                } catch {
                    return item;
                }
            })
        )
    );

    return {
        ...feed,
        title: `${feed.title} - CSDN博客`,
        item: items,
    };
}
