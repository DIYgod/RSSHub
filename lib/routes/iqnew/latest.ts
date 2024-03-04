// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const rootUrl = 'https://www.iqnew.com';
    const url = rootUrl + '/post/new_100/';
    const response = await got({
        method: 'get',
        url,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gb2312'));
    const list = $('.page-main-list .list-item a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: rootUrl + item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, 'gb2312'));

                item.title = content('.main-article .title').text();
                item.pubDate = timezone(parseDate(content('.time').eq(0).text()), 8);
                item.description = content('.content-intro').html();
                item.author = content('.author a').text();
                item.category = content('.keyword > a')
                    .toArray()
                    .map((item) => $(item).text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '爱Q生活网 - 最近更新',
        link: url,
        item: items,
    });
};
