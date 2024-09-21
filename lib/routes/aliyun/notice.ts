import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const typeMap = {
    0: '9004748',
    1: '9004749',
    2: '9213612',
    3: '8314815',
    4: '9222707',
};

/**
 *
 * @param ctx {import('koa').Context}
 */
export const route: Route = {
    path: '/notice/:type?',
    categories: ['programming'],
    example: '/aliyun/notice',
    parameters: { type: 'N' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公告',
    maintainers: ['muzea'],
    handler,
    description: `| 类型     | type |
  | -------- | ---- |
  | 全部     |      |
  | 升级公告 | 1    |
  | 安全公告 | 2    |
  | 备案公告 | 3    |
  | 其他     | 4    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const url = `https://help.aliyun.com/noticelist/${typeMap[type] || typeMap[0]}.html`;
    const response = await got({ method: 'get', url });
    const $ = load(response.data);
    const list = $('ul > li.notice-li')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text().trim();
            const link = 'https://help.aliyun.com' + element.find('a').attr('href').trim();
            const date = element.find('.y-right').text();
            const pubDate = timezone(parseDate(date), +8);
            return {
                title,
                description: '',
                link,
                pubDate,
            };
        })
        .get();

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemReponse = await got(item.link);
                const itemElement = load(itemReponse.data);
                item.description = itemElement('#se-knowledge').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text().trim(),
        link: url,
        item: result,
    };
}
