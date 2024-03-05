// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
const zlib = require('zlib');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
const { getAcwScV2ByArg1 } = require('./utils');

export default async (ctx) => {
    const rootUrl = 'https://csgo.5eplay.com/';
    const apiUrl = `${rootUrl}api/article?page=1&type_id=0&time=0&order_by=0`;
    const articleUrl = `${rootUrl}article`;

    const { data: response } = await got({
        method: 'get',
        url: apiUrl,
    });

    // get acw_sc__v2
    const acw_sc__v2 = await cache.tryGet(
        articleUrl,
        async () => {
            // Zlib Z_BUF_ERROR: unexpected end of file, should close decompress
            const detailResponse = await got(
                {
                    method: 'get',
                    url: articleUrl,
                },
                {
                    decompress: false,
                }
            );

            const unzipData = zlib.createUnzip({
                chunkSize: 20 * 1024,
            });
            unzipData.write(detailResponse.body);

            let acw_sc__v2 = '';
            for await (const data of unzipData) {
                const strData = data.toString();
                const matches = strData.match(/var arg1='(.*?)';/);
                if (matches) {
                    acw_sc__v2 = getAcwScV2ByArg1(matches[1]);
                    break;
                }
            }
            return acw_sc__v2;
        },
        Math.min(config.cache.routeExpire, 25 * 60),
        false
    );

    const items = await Promise.all(
        response.data.list.map((item) =>
            cache.tryGet(item.jump_link, async () => {
                if (!acw_sc__v2) {
                    return {
                        title: item.title,
                        description: item.title + (item.images?.[0] ? `<img src="${item.images[0]}" />` : ''),
                        pubDate: parseDate(item.dateline * 1000),
                        link: item.jump_link,
                    };
                }
                const { data: detailResponse } = await got({
                    method: 'get',
                    url: item.jump_link,
                    headers: {
                        cookie: `acw_sc__v2=${acw_sc__v2}`,
                    },
                });
                const $ = load(detailResponse);

                const content = $('.article-text');
                const res = [];

                content.find('> p, > blockquote').each((i, e) => {
                    res.push($(e).text());
                    const src = $(e).find('img').first().attr('src');
                    if (src && !src.includes('data:image/png;base64')) {
                        // drop base64 img
                        res.push(`<img src=${src} />`);
                    }
                });

                return {
                    title: item.title,
                    description: res.join('<br />'),
                    pubDate: parseDate(item.dateline * 1000),
                    link: item.jump_link,
                };
            })
        )
    );

    ctx.set('data', {
        title: '5EPLAY',
        link: 'https://csgo.5eplay.com/article',
        item: items,
    });
};
