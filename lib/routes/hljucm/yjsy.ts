import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yjsy/:category?',
    categories: ['university'],
    example: '/hljucm/yjsy',
    parameters: { category: '分类, 见下表，默认为新闻动态' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院',
    maintainers: ['nczitzk'],
    handler,
    description: `| 新闻动态 | 通知公告 |
| -------- | -------- |
| xwdt     | tzgg     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'xwdt';

    const rootUrl = 'https://yjsy.hljucm.net';
    const currentUrl = `${rootUrl}/index/${category}.htm`;

    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.postlist a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);

                item.description = content('#vsb_newscontent').html();
                item.pubDate = timezone(parseDate(content('.timestyle56043').text()), +8);

                const files = detailResponse.data.match(/<span>附件【<a href="(.*)"><span>(.*)<\/span><\/a>】<\/span>/g);

                if (files) {
                    for (const file of files) {
                        const { link, name } = file.match(/【<a href="(?<link>.*)"><span>(?<name>.*)<\/span><\/a>】/).groups;
                        item.description += `<a href="${link}">${name}</a>`;
                    }
                }

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
