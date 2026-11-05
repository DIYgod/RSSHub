import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:caty',
    categories: ['government'],
    example: '/gov/npc/c183',
    parameters: { caty: '分类名，支持形如 `http://www.npc.gov.cn/npc/c2/*/` 的网站，传入 npc 之后的参数' },
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
            source: ['npc.gov.cn/npc/c2/:caty'],
        },
    ],
    name: '通用',
    maintainers: ['233yeee'],
    handler,
    description: `| 立法 | 监督 | 代表 | 理论 | 权威发布 | 滚动新闻 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| c183 | c184 | c185 | c189 | c12435   | c10134   |`,
};

async function handler(ctx) {
    const caty = ctx.req.param('caty');
    // Fetch the category page.
    const baseurl = `http://www.npc.gov.cn/npc/c2/${caty}/`;
    const response = await got(baseurl);
    const data = response.data;
    const $ = load(data);
    const title = $('title').text();
    // Extract article links.
    const links = $('.clist a')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const dateText = $item.next('span').text();
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, baseurl).href,
                pubDate: dateText ? timezone(parseDate(dateText, 'YYYY-MM-DD'), 8) : undefined,
            };
        });
    // Fetch article metadata and content.
    const items = await pMap<DataItem & { link: string }, DataItem>(
        links,
        (item) => {
            const { link } = item;
            if (new URL(link).pathname.endsWith('.pdf')) {
                return { ...item, enclosure_url: link, enclosure_type: 'application/pdf' };
            }
            return cache.tryGet(link, async () => {
                const response = await got(link);
                const data = response.data;
                const $ = load(data);
                const title = $('title').text().replace('_中国人大网', '');
                const time = $('script:contains("fbrq")')
                    .text()
                    .match(/fbrq = "(.*?)"/)?.[1];
                const description = $('#Zoom').html();

                return {
                    title,
                    link,
                    description,
                    pubDate: time ? timezone(parseDate(time, 'YYYY年MM月DD日 HH:mm'), 8) : item.pubDate,
                };
            });
        },
        { concurrency: 3 }
    );
    // Build the feed.
    return {
        title,
        link: baseurl,
        description: title,
        item: items,
    };
}
