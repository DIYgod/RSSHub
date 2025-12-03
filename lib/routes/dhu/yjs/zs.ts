import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://yjszs.dhu.edu.cn';

const map = {
    doctor: '/7126/list.htm',
    master: '/7128/list.htm',
};
export const route: Route = {
    path: '/yjs/zs/:type?',
    categories: ['university'],
    example: '/dhu/yjs/zs/master',
    parameters: { type: '默认为 `master`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生招生信息',
    maintainers: ['fox2049'],
    handler,
    description: `| 博士招生 | 硕士招生 |
| -------- | -------- |
| doctor   | master   |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'master';
    const link = `${baseUrl}${map[type]}`;
    const { data: response } = await got(link);

    const $ = load(response);
    const list = $('.list_item')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.attr('title'),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('.Article_PublishDate').text()),
            };
        });

    // item content
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.wp_articlecontent').first().html();
                return item;
            })
        )
    );

    return {
        title: '东华大学研究生-' + $('.col_title').text(),
        link,
        item: items,
    };
}
