// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

const host = 'https://guangdiu.com';

export default async (ctx) => {
    const query = ctx.req.param('query') ?? '';
    const url = `${host}/cheaps.php${query ? `?${query}` : ''}`;

    const response = await got(url);
    const $ = load(response.data);

    const items = $('div.cheapitem.rightborder')
        .map((_index, item) => ({
            title: $(item).find('div.cheaptitle').text().trim() + $(item).find('a.cheappriceword').text(),
            link: $(item).find('a.cheappriceword').attr('href'),
            description: $(item).find('div.cheapimga').html(),
            pubDate: parseRelativeDate($(item).find('span.cheapaddtimeword').text()),
        }))
        .get();

    ctx.set('data', {
        title: `逛丢 - 九块九`,
        link: url,
        item: items,
    });
};
