import { Route } from '@/types';
import cache from '@/utils/cache';
// Warning: The author still knows nothing about javascript!

// params:
// type: notification type

import got from '@/utils/got'; // get web content
import { load } from 'cheerio'; // html parser
import getArticle from './_article';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/sse/:type?',
    categories: ['university'],
    example: '/tongji/sse/xytz',
    parameters: { type: '通知类型，默认为 `xytz`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '软件学院通知',
    maintainers: ['sgqy'],
    handler,
    description: `| 本科生通知 | 研究生通知 | 教工通知 | 全体通知 | 学院通知 | 学院新闻 | 学院活动 |
| ---------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| bkstz      | yjstz      | jgtz     | qttz     | xytz     | xyxw     | xyhd     |

  注意: \`qttz\` 与 \`xytz\` 在原网站等价.`,
};

async function handler(ctx) {
    const baseUrl = 'https://sse.tongji.edu.cn';
    const type = ctx.req.param('type') || 'xytz';
    const subType = ['bkstz', 'yjstz', 'jgtz', 'qttz'];

    const listUrl = `${baseUrl}/xxzx/${subType.includes(type) ? `xytz/${type}` : type}.htm`;
    const response = await got({
        method: 'get',
        url: listUrl,
    });
    const data = response.data; // content is html format
    const $ = load(data);

    // get urls
    const detailUrls = $('.data-list li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.data-list-time').text(), 'YYYY-MM-DD'),
            };
        });

    // get articles
    const articleList = await Promise.all(detailUrls.map((item) => cache.tryGet(item.link, () => getArticle(item))));

    // feed the data
    return {
        title: '同济大学软件学院',
        link: listUrl,
        item: articleList,
    };
}
