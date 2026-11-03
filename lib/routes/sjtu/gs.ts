import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { fetchArticle } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/gs/:type/:num?',
    categories: ['university'],
    example: '/sjtu/gs/xsjy',
    parameters: { type: '类别', num: '细分类别, 仅对`type`为`exchange`有效' },
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
    description: `| 工作信息 | 培养信息 | 学位学科 | 国际交流 | 创新工程 |
| -------- | -------- | -------- | -------- | -------- |
| work     | train    | degree   | exchange | xsjy     |

招生信息已移至研究生招生网，请使用「研究生招生网招考信息」路由 \`/sjtu/yzb/zkxx/:type\`。

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
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate'>>(`sjtu:gs:details:v5:${item.link}`, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    const article = await fetchArticle(item.link);
                    return { description: article.description, pubDate: article.pubDate };
                }
                // Other sites, such as csc.edu.cn or jwc.sjtu.edu.cn, use their own page layout
                if (new URL(item.link).hostname !== 'www.gs.sjtu.edu.cn') {
                    return {};
                }
                try {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const content = load(detailResponse.data);
                    return { description: content('.mce-content-body').html() };
                } catch (error) {
                    // Some notices are for logged-in students only and redirect to the jAccount login
                    if (error instanceof FetchError && error.response?.url.startsWith('https://jaccount.sjtu.edu.cn/')) {
                        return {};
                    }
                    throw error;
                }
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
