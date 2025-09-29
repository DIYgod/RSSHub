import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { config } from '@/config';
import { load } from 'cheerio';
import type { Context } from 'hono';
import { getCookie, getThread } from './common';

export const route: Route = {
    path: '/author/:id?',
    categories: ['bbs'],
    example: '/sis001/author/13131575',
    parameters: { id: '作者 ID，可以在作者的个人空间地址找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '作者',
    maintainers: ['keocheung'],
    handler,
};

async function handler(ctx: Context) {
    const { id = '13131575' } = ctx.req.param();
    const url = `${config.sis001.baseUrl}/forum/space.php?uid=${id}`;

    const cookie = await getCookie(url);
    const response = await got(url, { headers: { cookie } });
    const $ = load(response.data);

    const username = $('div.bg div.title').text().replace('的个人空间', '');

    let items = $('div.center_subject ul li a[href^=thread]')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${config.sis001.baseUrl}/forum/${item.attr('href')}`,
                author: username,
            };
        });

    items = await Promise.all(items.map((item) => cache.tryGet(item.link, async () => await getThread(cookie, item))));

    return {
        title: `${username}的主题`,
        link: url,
        item: items,
    };
}
