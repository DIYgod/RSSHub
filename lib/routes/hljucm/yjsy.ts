import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

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

    const list = $('.postlist a, .thumblist li.item > a[href*="/info/"]')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            return {
                title: $item.attr('title')!,
                link: new URL($item.attr('href')!, currentUrl).href,
            };
        });

    const items = await pMap<DataItem & { link: string }, DataItem>(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`hljucm:article-details:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate'> = {};
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);

                details.description = content('#vsb_newscontent, .v_news_content').first().html();
                if (!details.description?.trim()) {
                    throw new Error(`The university article has no main content: ${item.link}`);
                }
                const dateText = content('.timestyle56043, .ArticleMessage span')
                    .first()
                    .text()
                    .replaceAll(/[年月]/g, '-')
                    .replaceAll('日', '');
                const dateMatch = dateText.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?/);
                const pubDate = dateMatch ? parseDateInTimezone(dateMatch[0], 8) : undefined;
                details.pubDate = pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined;

                const files = detailResponse.data.match(/<span>附件【<a href="(.*)"><span>(.*)<\/span><\/a>】<\/span>/g);

                if (files) {
                    for (const file of files) {
                        const { link, name } = file.match(/【<a href="(?<link>.*)"><span>(?<name>.*)<\/span><\/a>】/).groups;
                        details.description += `<a href="${link}">${name}</a>`;
                    }
                }

                return details;
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
