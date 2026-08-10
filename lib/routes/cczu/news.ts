import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:category?',
    categories: ['university'],
    example: '/cczu/news/6620',
    parameters: { category: '可选，默认为 `all`' },
    name: '新闻网',
    maintainers: ['stdrc'],
    description: `| 全部 | 常大要闻 | 校园快讯 | 媒体常大 | 时事热点 | 高教动态 | 网上橱窗 | 新媒常大 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| all  | 6620     | 6621     | 6687     | 6628     | 6629     | 6640     | 6645     |`,
    handler,
};

const baseTitle = '常大新闻网';
const baseUrl = 'https://news.cczu.edu.cn';
const entryUrlRegex = /^\/(20\d{2})\/(\d{2})(\d{2})\/.*$/;

async function handler(ctx: Context) {
    const { category = 'all' } = ctx.req.param();
    const pageUrl = baseUrl + (category === 'all' ? '/' : `/${category}/list.htm`);

    const response = await ofetch(pageUrl);

    const $ = load(response);

    return {
        link: pageUrl,
        title: category === 'all' ? baseTitle : `${baseTitle} ${$('title').text()}`,
        item: $('.news_title a')
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
