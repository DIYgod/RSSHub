import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/scit/:type',
    categories: ['university'],
    example: '/nju/scit/tzgg',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '科学技术处',
    maintainers: ['ret-1'],
    handler,
    description: `| 通知公告 | 科研动态 |
| -------- | -------- |
| tzgg     | kydt     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const type_dict = {
        tzgg: ['https://scit.nju.edu.cn/10916/list.htm', '通知公告'],
        kydt: ['https://scit.nju.edu.cn/11003/list.htm', '科研动态'],
    };
    const response = await got({
        method: 'get',
        url: type_dict[type][0],
    });

    const data = response.data;

    const $ = load(data);
    const list = $('li.list_item');

    return {
        title: `科学技术处-${type_dict[type][1]}`,
        link: type_dict[type][0],
        item: list.toArray().map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: 'https://scit.nju.edu.cn' + item.find('a').attr('href'),
                pubDate: timezone(parseDate(item.find('.Article_PublishDate').first().text(), 'YYYY-MM-DD'), +8),
            };
        }),
    };
}
