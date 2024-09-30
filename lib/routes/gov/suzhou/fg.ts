import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/suzhou/fg/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'szfgw/ggl/nav_list' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://fg.suzhou.gov.cn';
    const currentUrl = new URL(`${category}.shtml`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('h4 a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') || item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                author: item.find('.author').text(),
                pubDate: parseDate(item.parent().find('span.time').text().trim()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('ucaptitle').text().trim();
                item.description = content('ucapcontent').html();
                item.author = content('span.ly b').text().trim();
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

    const author = $('meta[name="SiteName"]').prop('content');
    const subtitle = $('meta[name="ColumnName"]').prop('content');
    const image = new URL($('div.logo img').prop('src'), rootUrl).href;

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        subtitle,
        author,
    };
}
