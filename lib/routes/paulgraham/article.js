import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'http://paulgraham.com';
    const currentUrl = new URL('articles.html', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('font a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const description = content('font').first();

                item.title = content('title').text();
                item.description = description.html();
                item.pubDate = parseDate(description.contents().first().text(), 'MMMM YYYY');

                return item;
            })
        )
    );

    const author = 'Paul Graham';
    const title = $('title').text();
    const icon = $('link[rel="shortcut icon"]').prop('href');

    ctx.set('data', {
        item: items,
        title: `${author} - ${title}`,
        link: currentUrl,
        description: title,
        language: 'en',
        image: $(`img[alt="${title}"]`).prop('src'),
        icon,
        logo: icon,
        subtitle: title,
        author,
        allowEmpty: true,
    });
};
