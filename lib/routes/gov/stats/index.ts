// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15;

    const defaultPath = '/sj/zxfb/';

    const rootUrl = 'http://www.stats.gov.cn';
    const currentUrl = `${rootUrl}${getSubPath(ctx) === '/stats' ? defaultPath : getSubPath(ctx).replace(/^\/stats(.*)/, '$1/')}`;

    let response = await got({
        method: 'get',
        url: rootUrl,
    });

    const headers = {
        cookie: response.headers['set-cookie'].join(' ').match(/(wzws_sessionid=.*?);/)[1],
    };

    response = await got({
        method: 'get',
        url: currentUrl,
        headers,
    });

    const $ = load(response.data);

    let items = $($('a.pchide').length === 0 ? 'a[title]' : '.list-content a.pchide')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers,
                });

                const content = load(detailResponse.data);

                // articles from www.news.cn or www.gov.cn

                if (/(news\.cn|www\.gov\.cn)/.test(item.link)) {
                    if (content('.year').text()) {
                        item.pubDate = timezone(parseDate(`${content('.year').text()}/${content('.day').text()} ${content('.time').text()}`, 'YYYY/MM/DD HH:mm:ss'), +8);
                        item.author = content('.source')
                            .text()
                            .replace(/来源：/, '')
                            .trim();
                    } else {
                        content('.pages_print').remove();

                        const info = content('.info, .pages-date').text().split('来源：');
                        item.pubDate = timezone(parseDate(info[0].trim()), +8);
                        item.author = info.pop();
                    }

                    item.title = item.title || content('h1').first().text() || content('h2').first().text();
                    item.description = content('#detail, .xlcontent, .pages_content').html();

                    return item;
                }

                try {
                    item.author = detailResponse.data.match(/来源：(.*?)</)[1].trim();
                } catch {
                    item.author = content('div.detail-title-des h2 span').first().text().split(':').pop().trim();
                }

                content('.pchide').remove();

                item.title = item.title || content('div.detail-title h1').text();
                item.pubDate = timezone(parseDate(content('div.detail-title-des h2 p, .info').first().text().trim()), +8);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    description: content('.TRS_Editor').html(),
                    attachments: content('a[oldsrc]')
                        .toArray()
                        .map((a) => {
                            a = $(a);
                            return {
                                link: new URL(a.attr('href'), item.link).href,
                                name: a.text().trim(),
                            };
                        }),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
