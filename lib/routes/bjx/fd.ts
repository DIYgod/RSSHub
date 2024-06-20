import { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/fd/:type',
    categories: ['traditional-media'],
    example: '/bjx/fd/yw',
    parameters: { type: '文章分类' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '风电',
    maintainers: ['hualiong'],
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const response = await got({
            method: 'get',
            url: `https://fd.bjx.com.cn/${type}/`,
        });
        const data = response.data;
        const $ = load(data);
        const typeName = $('div.box2 em:last').text();
        const list = $('div.cc-list-content ul li');

        return {
            title: `北极星风力发电网${typeName}`,
            description: $('meta[name="Description"]').attr('content'),
            link: `https://fd.bjx.com.cn/${type}/`,
            item: list
                .map((index, item) => {
                    const each = $(item);
                    return {
                        title: each.find('a').attr('title'),
                        description: each.html(),
                        link: each.find('a').attr('href'),
                        pubDate: parseDate(each.find('span').text()),
                    };
                })
                .get() as DataItem[],
        };
    },
    description: `\`:type\` 类型可选如下

  | 要闻 | 政策 | 数据 | 市场 | 企业 | 招标 | 技术 | 报道 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| yw   | zc   | sj   | sc   | mq   | zb   | js   | bd   |`,
};
