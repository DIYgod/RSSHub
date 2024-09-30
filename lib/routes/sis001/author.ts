import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseUrl, getThread } from './common';

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
    },
    name: '作者',
    maintainers: ['keocheung'],
    handler,
};

async function handler(ctx) {
    const { id = '13131575' } = ctx.req.param();
    const url = `${baseUrl}/forum/space.php?uid=${id}`;

    const response = await got(url);
    const $ = load(response.data);

    const username = $('div.bg div.title').text().replace('的个人空间', '');

    let items = $('div.center_subject ul li a[href^=thread]')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${baseUrl}/forum/${item.attr('href')}`,
                author: username,
            };
        });

    items = await Promise.all(items.map((item) => cache.tryGet(item.link, async () => await getThread(item))));

    return {
        title: `${username}的主题`,
        link: url,
        item: items,
    };
}
