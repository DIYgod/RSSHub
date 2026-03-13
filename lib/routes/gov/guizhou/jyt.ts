import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/guizhou/jyt/tzgg',
    categories: ['government'],
    example: '/gov/guizhou/jyt/tzgg',
    parameters: {},
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
            source: ['jyt.guizhou.gov.cn/zwgk/tzgg/', 'jyt.guizhou.gov.cn/zwgk/tzgg/index.html'],
            target: '/guizhou/jyt/tzgg',
        },
    ],
    name: '贵州省教育厅 - 通知公告',
    maintainers: ['sheetung'],
    handler,
    url: 'jyt.guizhou.gov.cn/zwgk/tzgg/',
    description: '贵州省教育厅官方网站通知公告RSS源',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const baseUrl = 'https://jyt.guizhou.gov.cn';
    const currentUrl = `${baseUrl}/zwgk/tzgg/`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const list = $('.NewsList li:not(.b)')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            const title = $link.attr('title') || $link.text().trim();
            const link = $link.attr('href') || '';
            const dateText = $item.find('span').text().trim();

            return {
                title,
                link: link.startsWith('http') ? link : new URL(link, baseUrl).href,
                pubDate: parseDate(dateText),
            };
        });

    const items = (await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link as string);

                const $$ = load(detailResponse);

                const pubDate = $$('meta[name="PubDate"]').attr('content');
                const author = $$('meta[name="ContentSource"]').attr('content') || '贵州省教育厅';

                return {
                    ...item,
                    author,
                    pubDate: pubDate ? timezone(parseDate(pubDate), +8) : item.pubDate,
                    description: $$('.trs_editor_view').html() || $$('.TRS_UEDITOR').html(),
                };
            })
        )
    )) as DataItem[];

    return {
        title: '贵州省教育厅 - 通知公告',
        link: currentUrl,
        item: items,
        description: '贵州省教育厅门户网站通知公告',
    };
}
