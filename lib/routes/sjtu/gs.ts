import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { fetchArticle } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/gs/:type/:num?',
    categories: ['university'],
    example: '/sjtu/gs/enroll/59',
    parameters: { type: '类别', num: '细分类别, 仅对`type`为`enroll`或`exchange`有效' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gs.sjtu.edu.cn/announcement/:type'],
            target: '/gs/:type',
        },
        {
            source: ['www.gs.sjtu.edu.cn/announcement/:type'],
            target: '/gs/:type',
        },
        {
            source: ['gs.sjtu.edu.cn/announcement/:type/:num'],
            target: '/gs/:type/:num',
        },
        {
            source: ['www.gs.sjtu.edu.cn/announcement/:type/:num'],
            target: '/gs/:type/:num',
        },
    ],
    name: '研究生通知公告',
    maintainers: ['dzx-dzx'],
    handler,
    description: `| 工作信息 | 招生信息 | 培养信息 | 学位学科 | 国际交流 | 创新工程 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| work     | enroll   | train    | degree   | exchange | xsjy     |

当\`type\`为\`enroll\`, \`num\`可选字段:

| 58       | 59       | 60         | 61       | 62       |
| -------- | -------- | ---------- | -------- | -------- |
| 博士招生 | 硕士招生 | 港澳台招生 | 考点信息 | 院系动态 |

当\`type\`为\`exchange\`, \`num\`可选字段:

| 67             | 68             | 69             | 70             | 71             |
| -------------- | -------------- | -------------- | -------------- | -------------- |
| 国家公派研究生 | 国际化培养资助 | 校际交换与联培 | 交流与合作项目 | 项目招募与宣讲 |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const num = ctx.req.param('num') ?? '';

    const rootUrl = 'https://www.gs.sjtu.edu.cn';
    const currentUrl = `${rootUrl}/announcement/${type}/${num}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('a.announcement-item')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            const day = $item.find('.day').text().trim().replace('.', '-');
            const year = $item.find('.month').text().trim();

            return {
                title: $item.find('.title').text(),
                link: `${$item.attr('href')!.startsWith('http') ? '' : rootUrl}${$item.attr('href')}`,
                pubDate: year && day ? parseDate(`${year}-${day} +0000`, 'YYYY-MM-DD ZZ') : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate'>>(`sjtu:gs:details:v4:${item.link}`, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    const article = await fetchArticle(item.link);
                    return { description: article.description, pubDate: article.pubDate };
                }
                const detailResponse = await got({ method: 'get', url: item.link });
                const content = load(detailResponse.data);
                return { description: content('.page-content').html() };
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: `${num === '' ? '' : `${$('.category-nav-block .active').text().trim()} - `}${$('div.inner-banner-text .title').text().trim()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
}
