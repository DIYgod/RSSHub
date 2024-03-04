// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const language = ctx.req.param('language') ?? 'en';

    const rootUrl = 'https://nodejs.org';
    const currentUrl = `${rootUrl}/${language}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.summary').remove();

    let items = $('ul.blog-index li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.pubDate = parseDate(content('time').attr('datetime'));
                item.author = content('.blogpost-meta')
                    .text()
                    .match(/by (.*), /)?.[1];

                content('.blogpost-header').remove();

                item.description = content('article').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'News - Node.js',
        link: currentUrl,
        item: items,
    });
};
