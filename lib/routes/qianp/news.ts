import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { getTokenAndSecret } from './utils';

export const route: Route = {
    path: '/news/:path{.+}?',
    categories: ['new-media'],
    example: '/qianp/news',
    parameters: { path: '路径，可在URL中找到，默认为 `news/recommend`' },
    name: '知识库／资讯',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://qianp.com';
    const { path = 'news/recommend' } = ctx.req.param();
    const url = `${baseUrl}/${path}/`;

    const { token, secret } = await getTokenAndSecret();
    const headers = {
        cookie: token ? `t=${token}; r=${secret - 100}` : undefined,
    };
    const { data: response } = await got(url, {
        headers,
    });
    const $ = load(response);

    const list = $('.newslist .infor')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.attr('title'),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    headers,
                });
                const $ = load(response);

                item.category = [...new Set($('meta[name=keywords]').attr('content').split('，'))];
                item.author = $('meta[name=author]').attr('content');
                item.pubDate = parseDate($('meta[property="bytedance:published_time"]').attr('content'));

                item.description = $('.news_center').html();

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: url,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
