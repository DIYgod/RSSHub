import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import util from './utils';

const map = new Map([
    [1, { title: '硕士招生 - 深圳大学研究生招生网' }],
    [2, { title: '博士招生 - 深圳大学研究生招生网' }],
]);

export const route: Route = {
    path: '/yz/:type?',
    categories: ['university'],
    example: '/szu/yz/1',
    parameters: { type: '默认为 `1`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生招生网',
    maintainers: ['NagaruZ'],
    handler,
    description: `| 研究生 | 博士生 |
| ------ | ------ |
| 1      | 2      |`,
};

async function handler(ctx) {
    let type = Number.parseInt(ctx.req.param('type'));
    const struct = {
        1: {
            selector: {
                list: '.list',
                item: 'li',
                content: '#vsb_content',
            },
            url: 'https://yz.szu.edu.cn/sszs/gg.htm',
        },
        2: {
            selector: {
                list: '.list',
                item: 'li',
                content: '#vsb_content, #vsb_content_2',
            },
            url: 'https://yz.szu.edu.cn/bszs/gg.htm',
        },
    };
    if (type !== 1 && type !== 2) {
        // fallback to default
        type = 1;
    }
    const url = struct[type].url;

    const response = await got(url);
    const data = response.data;

    const $ = load(data);
    const list = $(struct[type].selector.list).find(struct[type].selector.item).toArray();

    const name = $('title').text();
    const result = await util.ProcessFeed(list, cache, struct[type]);

    return {
        title: map.get(type).title,
        link: url,
        description: name,
        item: result,
    };
}
