import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/fd/:type',
    categories: ['traditional-media'],
    example: '/bjx/fd/yw',
    parameters: { type: '文章分类，详见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '风电',
    maintainers: ['hualiong'],
    description: `\`:type\` 类型可选如下

| 要闻 | 政策 | 数据 | 市场 | 企业 | 招标 | 技术 | 报道 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| yw   | zc   | sj   | sc   | mq   | zb   | js   | bd   |`,
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const response = await ofetch(`https://fd.bjx.com.cn/${type}/`);

        const $ = load(response);
        const list = $('div.cc-list-content ul li:nth-child(-n+20)')
            .toArray()
            .slice(0, getRouteLimit(ctx))
            .map((item): DataItem => {
                const each = $(item);
                const sourceLink = each.find('a').attr('href')!;
                const link = new URL(sourceLink);
                if (link.hostname === 'news.bjx.com.cn' && link.pathname.startsWith('/html/')) {
                    link.hostname = 'fd.bjx.com.cn';
                    link.pathname = link.pathname.replace('/html/', '/news/');
                }
                return {
                    title: each.find('a').attr('title')!,
                    link: link.href,
                    guid: sourceLink,
                    pubDate: timezone(parseDate(each.find('span').text()), 8),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const response = await ofetch(item.link!);
                    const $ = load(response);

                    const content = $('#article_cont');
                    if (!content.length) {
                        throw new Error(`The article content is unavailable: ${item.link}`);
                    }
                    item.description = content.html()!;
                    const date = $('.cc-headline .box p span').first().text();
                    if (date) {
                        item.pubDate = timezone(parseDate(date), 8);
                    }
                    const author = $('.cc-headline .box p > span')
                        .filter((_, span) => $(span).text().startsWith('作者：'))
                        .text();
                    item.author = author ? author.replace(/^作者：/, '') : undefined;
                    item.category = $('#key_word a')
                        .toArray()
                        .map((element) => $(element).text());
                    return item;
                })
            )
        );

        return {
            title: $('title').text(),
            description: $('meta[name="Description"]').attr('content'),
            link: `https://fd.bjx.com.cn/${type}/`,
            item: items,
        };
    },
};
