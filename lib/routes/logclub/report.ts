// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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

    ctx.set('data', {
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
    });
};
