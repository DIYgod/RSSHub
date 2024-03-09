import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

async function fetch(address) {
    const res = await got(address);
    const $ = load(res.data);
    return {
        description: $('[name="_newscontent_fromname"]').html(),
        link: address,
        guid: address,
    };
}

export const route: Route = {
    path: '/cse/:type?',
    categories: ['university'],
    example: '/csu/cse',
    parameters: { type: '类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机学院',
    maintainers: ['j1g5awi'],
    handler,
    description: `| 类型 | 学院新闻 | 通知公告 | 学术信息 | 学工动态 | 科研动态 |
  | ---- | -------- | -------- | -------- | -------- | -------- |
  | 参数 | xyxw     | tzgg     | xsxx     | xgdt     | kydt     |`,
};

async function handler(ctx) {
    const url = 'https://cse.csu.edu.cn/index/';
    const type = ctx.req.param('type') ?? 'tzgg';
    const link = url + type + '.htm';
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('.download li').get();
    const out = await Promise.all(
        list.map((item) => {
            const $ = load(item);
            const address = new URL($('a').attr('href'), url).href;
            const title = $('a').text();
            const pubDate = $('span').text();
            return cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                single.pubDate = parseDate(pubDate, 'YYYY/MM/DD');
                return single;
            });
        })
    );
    return {
        title: $('title').text(),
        link,
        item: out,
    };
}
