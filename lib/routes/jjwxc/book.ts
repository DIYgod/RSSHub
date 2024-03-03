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
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://www.jjwxc.net';
    const currentUrl = new URL(`onebook.php?novelid=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const author = $('meta[name="Author"]').prop('content');
    const keywords = $('meta[name="Keywords"]').prop('content').split(/,/);

    keywords.pop();

    const category = keywords.pop();

    let items = $('tr[itemprop="chapter"]')
        .toArray()
        .map((item) => {
            item = $(item);

            const chapterId = item.find('td').first().text().trim();
            const chapterName = item.find('span[itemprop="headline"]').text().trim();
            const chapterIntro = item.find('td').eq(2).text().trim();
            const chapterUrl = new URL(`onebook.php?novelid=${id}&chapterid=${chapterId}`, rootUrl).href;
            const chapterWords = item.find('td[itemprop="wordCount"]').text();
            const chapterClicks = item.find('td.chapterclick').text();
            const chapterUpdatedTime = item.find('td').last().text().trim();

            const isVip = item.find('span[itemprop="headline"] font').last().text() === '[VIP]';

            return {
                title: `${chapterName} ${chapterIntro}`,
                link: chapterUrl,
                description: art(path.join(__dirname, 'templates/book.art'), {
                    chapterId,
                    chapterName,
                    chapterIntro,
                    chapterUrl,
                    chapterWords,
                    chapterClicks,
                    chapterUpdatedTime,
                }),
                author,
                category: [isVip ? 'VIP' : undefined, ...(category?.split(/\s/) ?? [])].filter(Boolean),
                guid: `jjwxc-${id}#${chapterId}`,
                pubDate: timezone(parseDate(chapterUpdatedTime), +8),
                isVip,
            };
        });

    items.reverse();

    items = await Promise.all(
        items.slice(0, limit).map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.isVip) {
                    const { data: detailResponse } = await got(item.link, {
                        responseType: 'buffer',
                    });

                    const content = load(iconv.decode(detailResponse, 'gbk'));

                    content('span.favorite_novel').parent().remove();

                    item.description += art(path.join(__dirname, 'templates/book.art'), {
                        description: content('div.novelbody').html(),
                    });
                }

                delete item.isVip;

                return item;
            })
        )
    );

    const logoEl = $('div.logo a img');
    const image = `https:${logoEl.prop('src')}`;
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${logoEl.prop('alt').replace(/logo/, '')} | ${author}${keywords[0]}`,
        link: currentUrl,
        description: $('span[itemprop="description"]').text(),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="Description"]').prop('content'),
        author: $('meta[name="Author"]').prop('content'),
    });
};
