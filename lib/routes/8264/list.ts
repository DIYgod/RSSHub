// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { id = '751' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.8264.com';
    const currentUrl = new URL(`list/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    $('div.newslist_info').remove();

    let items = $('div.newlist_r, div.newslist_r, div.bbslistone_name, dt')
        .find('a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: link.startsWith('http') ? link : new URL(link, rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse, 'gbk'));

                content('a.syq, a.xlsj, a.titleoverflow200, #fjump').remove();
                content('i.pstatus').remove();
                content('div.crly').remove();

                const pubDate = content('span.pub-time').text() || content('span.fby span').first().prop('title') || content('span.fby').first().text().split('发表于').pop().trim();

                content('img').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: content(this).prop('file'),
                                alt: content(this).prop('alt'),
                            },
                        })
                    );
                });

                item.title = content('h1').first().text();
                item.description = content('div.art-content, td.t_f').first().html();
                item.author = content('a.user-name, #author').first().text();
                item.category = content('div.fl_dh a, div.site a')
                    .toArray()
                    .map((c) => content(c).text().trim());
                item.pubDate = timezone(parseDate(pubDate, ['YYYY-MM-DD HH:mm', 'YYYY-M-D HH:mm']), +8);

                return item;
            })
        )
    );

    const description = $('meta[name="description"]').prop('content').trim();
    const icon = new URL('favicon', rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${$('span.country, h2').text()} - ${description.split(',').pop()}`,
        link: currentUrl,
        description,
        language: 'zh-cn',
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content').trim(),
        author: $('meta[name="author"]').prop('content'),
    });
};
