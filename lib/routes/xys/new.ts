// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export default async (ctx) => {
    const rootUrl = 'http://www.xys.org';
    const currentUrl = `${rootUrl}/new.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    // 转码
    const data = iconv.decode(response.data, 'gb2312');

    const $ = load(data);

    let items = $('li a')
        .slice(4, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);
            let link = item.attr('href');
            /^https?:\/\//.test(link) || (link = rootUrl + '/' + link.replace(/^\//, ''));
            let date = item.parent().text().trim().slice(0, 8);
            date = parseDate(date, 'YY.MM.DD');
            return {
                title: item.text(),
                link,
                pubDate: date,
            };
        });

    items = await Promise.all(
        items
            .filter((item) => !item.link.endsWith('.zip'))
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const youTube = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-]+)&?/g;
                    const matchYoutube = item.link.match(youTube);

                    if (matchYoutube) {
                        item.description = art(path.join(__dirname, 'templates/desc.art'), { youTube: item.link.slice(32) });
                    } else {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                            responseType: 'buffer',
                        });

                        // 转码
                        const detailData = iconv.decode(detailResponse.data, 'gb2312');

                        const content = load(detailData);

                        item.description = content.text().replaceAll('\n', '<br>\n');
                    }

                    return item;
                })
            )
    );

    ctx.set('data', {
        title: '新语丝 - 新到资料',
        link: currentUrl,
        item: items,
    });
};
