import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
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
        .map((item) => {
            item = $(item);

            const day = item.find('.day').text().trim().replace('.', '-');
            const year = item.find('.month').text().trim();

            return {
                title: item.find('.title').text().trim(),
                link: `${item.attr('href').startsWith('http') ? '' : rootUrl}${item.attr('href')}`,
                pubDate: timezone(parseDate(`${year}-${day}`, 'YYYY-MM-DD'), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    item.description = (await fetchArticle(item.link)).description;
                } else {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = load(detailResponse.data);

                    item.description = content('.page-content').html();
                }

                return item;
            })
        )
    );

    return {
        title: `${num === '' ? '' : `${$('.category-nav-block .active').text().trim()} - `}${$('div.inner-banner-text .title').text().trim()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
}
