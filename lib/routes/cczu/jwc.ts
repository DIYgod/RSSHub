import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/cczu/jwc/1425',
    parameters: { category: '可选，默认为 `all`' },
    features: {
        antiCrawler: true,
    },
    name: '教务处',
    maintainers: ['stdrc'],
    description: `| 全部 | 通知公告 | 教务新闻 | 各类活动与系列讲座 | 本科教学工程 | 他山之石 | 信息快递 |
| ---- | -------- | -------- | ------------------ | ------------ | -------- | -------- |
| all  | 1425     | 1437     | 1485               | 1487         | 1442     | 1445     |`,
    handler,
};

const baseTitle = '常大教务处';
const baseUrl = 'https://jwc.cczu.edu.cn';
const entryUrlRegex = /^\/(20\d{2})\/(\d{2})(\d{2})\/.*$/;

async function handler(ctx: Context) {
    const { category = 'all' } = ctx.req.param();
    const pageUrl = baseUrl + (category === 'all' ? '/' : `/${category}/list.htm`);

    const response = await ofetch(pageUrl);

    const $ = load(response);

    return {
        link: pageUrl,
        title: category === 'all' ? baseTitle : `${baseTitle} ${$('title').text()}`,
        item: $('div[id^="wp_news_w"] a')
            .toArray()
            .slice(0, 10)
            .filter((elem) => entryUrlRegex.test(elem.attribs.href))
            .map((elem) => ({
                link: new URL(elem.attribs.href, pageUrl).href,
                title: elem.attribs.title,
                pubDate: timezone(parseDate(elem.attribs.href.replace(entryUrlRegex, '$1-$2-$3')), 8),
            })),
    };
}
