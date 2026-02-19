import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zbb/:type',
    categories: ['university'],
    example: '/nju/zbb/cgxx',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '招标办公室',
    maintainers: ['ret-1'],
    handler,
    description: `| 采购信息 | 成交公示 | 政府采购意向公开 |
| -------- | -------- | ---------------- |
| cgxx     | cjgs     | zfcgyxgk         |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    if (type === 'zfcgyxgk') {
        const url = `https://zbb.nju.edu.cn/zfcgyxgk/index.chtml`;

        const response = await got({
            method: 'get',
            url,
        });

        const data = response.data;

        const $ = load(data);
        const list = $('dd[cid]');

        return {
            title: '政府采购意向公开',
            link: url,
            item: list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a').attr('title'),
                    description: item.find('a').first().text(),
                    link: 'https://zbb.nju.edu.cn' + item.find('a').attr('href'),
                    pubDate: timezone(parseDate(item.find('span').first().text(), 'YYYY-MM-DD'), +8),
                };
            }),
        };
    } else {
        const title_dict = {
            cgxx: '采购信息',
            cjgs: '成交公示',
        };
        const category_dict = {
            hw: '货物类',
            gc: '工程类',
            fw: '服务类',
        };

        const items = await Promise.all(
            Object.keys(category_dict).map(async (c) => {
                const response = await got({
                    method: 'get',
                    url: `https://zbb.nju.edu.cn/${type}${c}/index.chtml`,
                });

                const data = response.data;
                const $ = load(data);
                const list = $('dd[cid]');

                return list.toArray().map((item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: item.find('a').first().text(),
                        link: 'https://zbb.nju.edu.cn' + item.find('a').attr('href'),
                        pubDate: timezone(parseDate(item.find('span').first().text(), 'YYYY-MM-DD'), +8),
                        category: category_dict[c],
                    };
                });
            })
        );

        return {
            title: title_dict[type],
            link: `https://zbb.nju.edu.cn/${type}hw/index.chtml`,
            item: [...items[0], ...items[1], ...items[2]],
        };
    }
}
