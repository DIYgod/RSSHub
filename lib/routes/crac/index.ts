// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'http://www.crac.org.cn';
    const type = ctx.req.param('type');
    const link = type ? `${baseUrl}/News/List?type=${type}` : `${baseUrl}/News/List`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);
    const list = $('div.InCont_r_d_cont > li')
        .map((_, item) => {
            item = $(item);
            return {
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('span.cont_d').text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(response.data);
                item.title = content('div.r_d_cont_title > h3').text();
                item.description = content('div.r_d_cont').html().trim().replaceAll('\n', '');
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link,
        item: list,
    });
};
