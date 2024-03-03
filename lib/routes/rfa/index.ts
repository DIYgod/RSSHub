// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    let url = 'https://www.rfa.org/' + (ctx.req.param('language') ?? 'english');

    if (ctx.req.param('channel')) {
        url += '/' + ctx.req.param('channel');
    }
    if (ctx.req.param('subChannel')) {
        url += '/' + ctx.req.param('subChannel');
    }

    const response = await got(url);
    const $ = load(response.data);

    const selectors = ['div[id=topstorywidefull]', 'div.two_featured', 'div.three_featured', 'div.single_column_teaser', 'div.sectionteaser', 'div.specialwrap'];
    const list = [];
    for (const selector of selectors) {
        $(selector).each((_, e) => {
            const item = {};
            item.title = $(e).find('h2 a span').first().text();
            item.link = $(e).find('h2 a').first().attr('href');
            list.push(item);
        });
    }

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const content = await got(item.link);

                const description = load(content.data);
                item.description = description('#headerimg').html() + description('div[id=storytext]').html();
                item.pubDate = parseDate(description('span[id=story_date]').text());
                if (description('meta[property=og:audio]').attr('content') !== undefined) {
                    item.enclosure_url = description('meta[property=og:audio]').attr('content');
                    item.enclosure_type = description('meta[property=og:audio:type]').attr('content');
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'RFA',
        link: 'https://www.rfa.org/',
        item: result,
    });
};
