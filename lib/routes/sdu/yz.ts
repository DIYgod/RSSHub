import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const host = 'https://www.yz.sdu.edu.cn';

export const route: Route = {
    path: '/yz/:type?',
    categories: ['university'],
    example: '/sdu/yz/tzgg',
    parameters: { type: '默认为`tzgg`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生招生信息网',
    maintainers: ['niuyi1017'],
    handler,
    description: `| 通知公告 | 招生拓展 | 政策文件 |
| -------- | -------- | -------- |
| tzgg     | zstz     | zcwj     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';
    const pageUrl = `${host}/index/${type}.htm`;

    const response = await got(pageUrl);
    const $ = load(response.data);
    const typeName = $('.nyrtit .tit').text() || '研究生招生信息网';
    let list = $('.txtList li')
        .toArray()
        .map((element) => {
            const $element = $(element);
            let itemDate = $element.find('.times').text();
            itemDate = (itemDate.slice(2) + '-' + itemDate.slice(0, 2)).replaceAll('.', '-').replaceAll(/\s/g, '');
            const aTag = $element.find('a');
            const title = aTag.attr('title') || aTag.text().trim();
            const itemPath = aTag.attr('href') ?? '';
            const link = itemPath.startsWith('http') ? itemPath : new URL('/' + itemPath, pageUrl).href;
            return {
                title,
                link,
                pubDate: parseDateInTimezone(itemDate, 8),
            };
        });

    list = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`yz:article-v2:${item.link}`, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                const content = $('.v_news_content');
                let description = '';
                if (content.length > 0) {
                    description = content.html()?.trim() ?? '';
                }
                const attachments = $('ul[style="list-style-type:none;"]');
                if (attachments.length > 0) {
                    description += attachments.html()?.trim() ?? '';
                }
                return {
                    description,
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: `山东大学研究生招生信息网 - ${typeName}`,
        description: $('title').text(),
        link: pageUrl,
        item: list,
    };
}
