import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';

import got, { parseCampusDate } from './utils';

const baseTitle = 'NUIST AS（南信大大气科学学院）';
const baseUrl = 'https://cas.nuist.edu.cn';

export const route: Route = {
    path: '/cas/:category?',
    categories: ['university'],
    example: '/nuist/cas/xxgg',
    parameters: { category: '默认为信息公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'NUIST AS（南信大大气科学学院）',
    maintainers: ['gylidian'],
    handler,
    description: `| 信息公告 | 新闻快讯 | 科学研究 | 网上公示 | 本科教育 | 研究生教育 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| xxgg     | xwkx     | kxyj     | wsgs     | bkjy     | yjsjy      |`,
};

async function handler(ctx) {
    const { category = 'xxgg' } = ctx.req.param();
    const link = `${baseUrl}/index/${category}.htm`;

    const response = await got(link);
    const $ = load(response.data);
    const list = $('#ctl00_ctl00_body_NewsList')
        .find('tr.gridline')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.find('.Title').text(),
                link: new URL($item.find('.Title').attr('href')!, baseUrl).href,
                pubDate: parseCampusDate(
                    $item
                        .find('td')
                        .eq(2)
                        .text()
                        .replaceAll(/[[\]]+/g, '')
                ),
            };
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link + ':content', async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    const authorMatch = $('.zzxx')
                        .text()
                        .match(/作者:(.*) 发布时间/);
                    const pubDate = parseCampusDate(
                        $('.zzxx')
                            .text()
                            .match(/发布时间:(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/)?.[1]
                    );
                    return { author: authorMatch ? authorMatch[1].trim() : undefined, ...(pubDate && { pubDate }), description: $('#vsb_content').html() };
                } catch {
                    // Intranet articles retain the public list metadata.
                    return {};
                }
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: baseTitle + '：' + $('.dqlm').find('a').eq(1).text(),
        description: $('meta[name=description]').attr('content'),
        link,
        item: items,
    };
}
