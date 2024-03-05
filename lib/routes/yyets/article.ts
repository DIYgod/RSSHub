// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseURL = 'https://yysub.net';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? '';
    const url = `${baseURL}/article${type ? '?type=' + type : ''}`;

    const response = await got(url);
    const $ = load(response.data);

    let items = $('.article-list li .fl-info')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('h3 a').text(),
                link: `${baseURL}${e.find('h3 a').attr('href')}`,
                author: e.find('p a').text(),
                pubDate: timezone(parseDate(e.find('p').eq(2).text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('.information-desc').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('title').text()} - 人人影视`,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        item: items,
    });
};
