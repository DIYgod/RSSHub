import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

interface SourceReport {
    id: number;
    title: string;
    img_url?: string;
    author?: string;
    channel_name: string;
    release_time?: string;
}

export const route: Route = {
    path: '/lc_report/:id?',
    categories: ['new-media'],
    example: '/logclub/lc_report',
    parameters: { id: '报告 id，见下表，默认为罗戈研究出品' },
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
            source: ['logclub.com/lc_report'],
            target: '/lc_report',
        },
        {
            title: '报告 - 罗戈研究出品',
            source: ['logclub.com/lc_report'],
            target: '/lc_report/Report',
        },
        {
            title: '报告 - 物流报告',
            source: ['logclub.com/lc_report'],
            target: '/lc_report/IndustryReport',
        },
        {
            title: '报告 - 绿色双碳报告',
            source: ['logclub.com/lc_report'],
            target: '/lc_report/GreenDualCarbonReport',
        },
    ],
    name: '报告',
    maintainers: ['nczitzk'],
    handler,
    description: `| 罗戈研究出品 | 物流报告       | 绿色双碳报告          |
| ------------ | -------------- | --------------------- |
| Report       | IndustryReport | GreenDualCarbonReport |`,
};

async function handler(ctx) {
    const { id = 'Report' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 11);

    const rootUrl = 'https://www.logclub.com';
    const currentUrl = new URL('lc_report', rootUrl).href;
    const apiUrl = new URL(`front/lc_report/load${id}List`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        json: {
            page: 1,
        },
    });

    const reports: SourceReport[] = response.list;
    let items = reports.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`front/lc_report/get_report_info/${item.id}`, rootUrl).href,
        description: renderDescription({
            image: {
                src: item.img_url?.split(/\?/, 1)[0] ?? undefined,
                alt: item.title,
            },
        }),
        author: item.author,
        category: [item.channel_name],
        guid: `logclub-report-${item.id}`,
        pubDate: item.release_time ? parseDateInTimezone(item.release_time, 8) : undefined,
    }));

    items = await pMap(
        items,
        async (item) => {
            const detailResponse = await cache.tryGet(`logclub:html:${item.link}`, async () => {
                const { data } = await got(item.link);
                return data;
            });

            const content = load(detailResponse);

            content('img').each((_, el) => {
                const $el = content(el);
                $el.replaceWith(
                    renderDescription({
                        image: {
                            src: $el.prop('src')?.split(/\?/, 1)[0] ?? undefined,
                            alt: $el.prop('title'),
                        },
                    })
                );
            });

            item.title = content('h1').first().text();
            item.description += renderDescription({
                description: content('div.article-cont').html() ?? undefined,
            });
            item.author = content('div.lc-infos a')
                .toArray()
                .map((a) => content(a).text())
                .join('/');
            item.category = [
                ...new Set([
                    ...(item.category ?? []),
                    ...content('div.article-label-r a.label')
                        .toArray()
                        .map((c) => content(c).text()),
                ]),
            ].filter(Boolean);

            return item;
        },
        { concurrency: 3 }
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('div.this_nav').text().trim();
    const icon = new URL($('link[rel="shortcut icon"]').prop('href')!, rootUrl).href;
    const subtitle = $('meta[name="keywords"]').prop('content');

    return {
        item: items,
        title: `${$('title').text()}${title}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh' as const,
        image: new URL($('div.logo_img img').prop('src')!, rootUrl).href,
        icon,
        logo: icon,
        subtitle: subtitle.replaceAll(',', ''),
        author: subtitle.split(/,/, 1)[0],
    };
}
