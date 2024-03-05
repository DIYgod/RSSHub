import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { config } from '@/config';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://pubsonline.informs.org';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'orsc';
    const cateUrl = `${rootUrl}/toc/${category}/0/0`;

    const getCookie = () =>
        cache.tryGet(cateUrl, async () => {
            const setCookiesUrl = `${cateUrl}?cookieSet=1`;

            const response = await got.extend({ followRedirect: false }).get(setCookiesUrl, {
                headers: {
                    Referer: cateUrl,
                },
            });
            const cookie = response.headers['set-cookie']
                .slice(1)
                .map((item) => item.split(';')[0])
                .join('; ');

            return cookie;
        });

    const response = await got.get(cateUrl, {
        headers: {
            referer: cateUrl,
            'User-Agent': config.ua,
            cookie: await getCookie(),
        },
    });
    const $ = load(response.data);
    const list = $('div.issue-item')
        .slice(0, 10)
        .map((_, item) => ({
            title: $(item).find('h5.issue-item__title').text(),
            link: `${rootUrl}${$(item).find('h5.issue-item__title > a').attr('href')}`,
            pubDate: parseDate($(item).find('div.rlist--inline.separator.toc-item__detail > p').remove('span').text()),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link, {
                    headers: {
                        referer: cateUrl,
                        'User-Agent': config.ua,
                        cookie: await getCookie(),
                    },
                });
                const detail = load(detailResponse.data);
                item.description = art(path.join(__dirname, 'templates/content.art'), {
                    author: detail('div.accordion-tabbed.loa-accordion').text(),
                    content: detail('div.hlFld-Abstract').find('h2').replaceWith($('<h2>Abstract </h2>')).end().html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `INFORMS - ${category}`,
        link: cateUrl,
        item: items,
    });
};
