import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: ['/lc_report/:id?', '/report/:id?'],
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
    name: '报告',
    maintainers: ['nczitzk'],
    handler,
    description: `| 罗戈研究出品 | 物流报告       | 绿色双碳报告          |
| ------------ | -------------- | --------------------- |
| Report       | IndustryReport | GreenDualCarbonReport |`,
};

async function handler(ctx) {
    const { id = 'Report' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 11;

    const rootUrl = 'https://www.logclub.com';
    const currentUrl = new URL('lc_report', rootUrl).href;
    const apiUrl = new URL(`front/lc_report/load${id}List`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        json: {
            page: 1,
        },
    });

    let items = response.list.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`front/lc_report/get_report_info/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: {
                src: item.img_url?.split(/\?/)[0] ?? undefined,
                alt: item.title,
            },
        }),
        author: item.author,
        category: [item.channel_name],
        guid: `logclub-report-${item.id}`,
        pubDate: timezone(parseDate(item.release_time), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('img').each((_, el) => {
                    el = content(el);
                    el.replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: el.prop('src')?.split(/\?/)[0] ?? undefined,
                                alt: el.prop('title'),
                            },
                        })
                    );
                });

                item.title = content('h1').first().text();
                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('div.article-cont').html(),
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
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('div.this_nav').text().trim();
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;
    const subtitle = $('meta[name="keywords"]').prop('content');

    return {
        item: items,
        title: `${$('title').text()}${title}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image: new URL($('div.logo_img img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: subtitle.replaceAll(',', ''),
        author: subtitle.split(/,/)[0],
    };
}
