import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/weekly/:category?',
    categories: ['other'],
    example: '/iresearch/weekly',
    parameters: { category: '分类，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '周度市场观察',
    maintainers: ['nczitzk'],
    handler,
    description: `| 家电行业 | 服装行业 | 美妆行业 | 食品饮料行业 |
  | -------- | -------- | -------- | ------------ |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://www.iresearch.com.cn';
    const currentUrl = `${rootUrl}/report?type=3`;
    const apiUrl = `${rootUrl}/api/json/report/ireport.json`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = JSON.parse(response.data.slice(1))
        .filter((item) => (category ? item.classname === category : true))
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 200)
        .map((item) => ({
            title: item.reportname,
            pubDate: parseDate(item.addtime),
            link: `${rootUrl}/report/detail?id=${item.id}`,
            category: [item.classname, ...item.keywords.split(',')],
            description: art(path.join(__dirname, 'templates/weekly.art'), {
                id: item.id,
                cover: item.reportpic,
                content: item.shortcoutent,
                pages: item.PagesCount,
            }),
        }));

    return {
        title: '艾瑞咨询 - 周度市场观察',
        link: currentUrl,
        item: items,
    };
}
