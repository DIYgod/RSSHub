import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/839studio/:id',
    categories: ['traditional-media'],
    example: '/thepaper/839studio/2',
    parameters: { id: '分类 id，可在分类页 URL 的 cat 参数中找到；全部作品使用 /thepaper/839studio' },
    description: `| 视频 | 交互 | 信息图 | 数据故事 |
| ---- | ---- | ------ | -------- |
| 2    | 4    | 3      | 453      |`,
    radar: [
        {
            source: ['thepaper.cn/'],
        },
    ],
    name: '澎湃美数课作品集 - 分类',
    maintainers: ['umm233'],
    handler,
    url: 'thepaper.cn/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `http://projects.thepaper.cn/thepaper-cases/839studio/?cat=${id}`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = load(data);
    const list = $('div[class=imgtext]');

    const category = $('div[class=lefth]').find('h1').text();
    const desc = $('div[class=leftc]').find('p').text();

    return {
        title: `澎湃美数课作品集-${category}`,
        link,
        description: desc,
        item: list.toArray().map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.archive_up a').text(),
                description: `描述：${$item.find('.imgdown p').text()}`,
                link: $item.find('.archive_up a').attr('href'),
            };
        }),
    };
}
