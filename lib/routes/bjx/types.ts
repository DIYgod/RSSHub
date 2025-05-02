import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/gf/:type',
    categories: ['traditional-media'],
    example: '/bjx/gf/sc',
    parameters: { type: '分类，北极星光伏最后的`type`字段' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '光伏',
    maintainers: ['Sxuet'],
    handler,
    description: `\`:type\` 类型可选如下

| 要闻 | 政策 | 市场行情 | 企业动态 | 独家观点 | 项目工程 | 招标采购 | 财经 | 国际行情 | 价格趋势 | 技术跟踪 |
| ---- | ---- | -------- | -------- | -------- | -------- | -------- | ---- | -------- | -------- | -------- |
| yw   | zc   | sc       | mq       | dj       | xm       | zb       | cj   | gj       | sj       | js       |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const response = await got({
        method: 'get',
        url: `https://guangfu.bjx.com.cn/${type}/`,
    });
    const data = response.data;
    const $ = load(data);
    const typeName = $('div.box2 em:last').text();
    const list = $('div.cc-list-content ul li');
    return {
        title: `北极星太阳能光大网${typeName}`,
        description: $('meta[name="Description"]').attr('content'),
        link: `https://guangfu.bjx.com.cn/${type}/`,
        item: list.toArray().map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                description: item.html(),
                link: item.find('a').attr('href'),
                pubDate: parseDate(item.find('span').text()),
            };
        }),
    };
}
