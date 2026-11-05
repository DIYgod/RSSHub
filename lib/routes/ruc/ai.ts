import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/ai/:category?',
    categories: ['university'],
    example: '/ruc/ai',
    parameters: { category: '分类，见下方说明，默认为学院公告（xwgg-xygg）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ai.ruc.edu.cn/', 'ai.ruc.edu.cn/xwgg/xygg/index.htm'],
            target: '/ai',
        },
    ],
    name: '高瓴人工智能学院',
    maintainers: ['yinhanyan'],
    handler: async (ctx) => {
        const aliases = { 'newslist/notice': 'xwgg/xygg', 'newslist/newsdetail': 'xwgg/xyxw' };
        const requestedCategory = ctx.req.param('category')?.replaceAll('-', '/') ?? 'xwgg/xygg';
        const category = aliases[requestedCategory] ?? requestedCategory;
        const indexUrl = `https://ai.ruc.edu.cn/${category}/index.htm`;
        const response = await ofetch<string>(indexUrl);
        const $ = load(response);
        const list = $('.listBox > ul > li > a')
            .toArray()
            .flatMap((element): Array<DataItem & { link: string }> => {
                const $element = $(element);
                const href = $element.attr('href');
                const title = $element.find('h6').text();
                if (!href || !title) {
                    return [];
                }
                const month = $element.find('.time p').text();
                const day = $element.find('.time b').text();
                return [{ title, link: new URL(href, indexUrl).href, pubDate: month && day ? parseDateInTimezone(`${month}-${day}`, 8) : undefined }];
            });
        const items = await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(item.link, async () => {
                    const response = await ofetch<string>(item.link);
                    const content = load(response);
                    const body = content('.articleCon');
                    body.find('style, script').remove();
                    const date = content('.articleTit .author')
                        .text()
                        .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                    return { description: body.html(), pubDate: date ? parseDateInTimezone(date, 8) : undefined };
                });
                return { ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate };
            },
            { concurrency: 3 }
        );
        return { title: $('title').text(), link: indexUrl, icon: 'https://www.ruc.edu.cn/favicon.ico', item: items };
    },
    url: 'ai.ruc.edu.cn/',
    description: `分类参数填写分类页地址中介于 \`https://ai.ruc.edu.cn/\` 和 \`/index.htm\` 之间的路径，并将 \`/\` 替换为 \`-\`。

例如 [学院公告](https://ai.ruc.edu.cn/xwgg/xygg/index.htm) 对应 \`xwgg-xygg\`；[学院新闻](https://ai.ruc.edu.cn/xwgg/xyxw/index.htm) 对应 \`xwgg-xyxw\`。旧参数 \`newslist-notice\` 和 \`newslist-newsdetail\` 分别映射到当前公告和新闻分类。`,
};
