import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://neunews.neu.edu.cn';

export const route: Route = {
    path: '/news/:type',
    categories: ['university'],
    example: '/neu/news/ddyw',
    parameters: { type: '种类名，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['neunews.neu.edu.cn/'], target: '/news/ddyw' },
        ...['ddyw', 'mtdd', 'tzgg', 'rcpy', 'zhxw', 'yxdt', 'jsdd', 'tsdd', 'xykd', 'rmdd', 'wsd', 'Focus', 'Media', 'Research'].map((type) => ({
            source: [`neunews.neu.edu.cn/${type}.htm`],
            target: `/news/${type}`,
        })),
    ],
    name: '新闻网',
    maintainers: ['JeasonLau'],
    handler,
    description: `| 种类名   | 参数 |
| -------- | ---- |
| 东大要闻 | ddyw |
| 媒体东大 | mtdd |
| 通知公告 | tzgg |
| 新闻纵横 | xwzh |
| 人才培养 | rcpy |
| 学术科研 | xsky |
| 英文新闻 | 217  |
| 招生就业 | zsjy |
| 考研出国 | kycg |
| 校园文学 | xywx |
| 校友风采 | xyfc |
| 时事热点 | ssrd |
| 教育前沿 | jyqy |
| 文化体育 | whty |
| 最新科技 | zxkj |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const newsUrl = `${baseUrl}/${type}.htm`;
    const response = await got(newsUrl);

    const data = response.data;
    const $ = load(data);

    const items = $('.n_left li[id^="line_"]')
        .toArray()
        .flatMap((item): Array<DataItem & { link: string }> => {
            const $item = $(item);
            const href = $item.find('a').attr('href');
            const title = $item.find('h2, h3').text();
            if (!href || !title) {
                return [];
            }
            const date = $item.find('time').text();
            return [{ title, link: new URL(href, baseUrl).href, pubDate: date ? timezone(parseDate(date, 'MM/DD/YYYY'), 8) : undefined }];
        });

    const results = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`${item.link}:article-body`, async () => {
                const result = await got(item.link);
                const $ = load(result.data);

                const author = $('.dtl_tit span')
                    .first()
                    .text()
                    .replace(/^来源[:：]\s*/, '');
                return { author, description: $('.article_content').html() };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: `东北大学新闻网-${$('head title').text()}`,
        link: newsUrl,
        item: results,
    };
}
