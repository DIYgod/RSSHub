import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/nifdc/:path{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { path = 'bshff/ylqxbzhgl/qxggtzh' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.nifdc.org.cn';
    const currentUrl = new URL(`nifdc/${path}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.list ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');
            const link = a.prop('href');

            return {
                title: a.prop('title') || a.text(),
                link: link.startsWith('http') ? link : new URL(link, currentUrl).href,
                pubDate: parseDate(item.find('span').text().replaceAll(/\(|\)/g, '')),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    item.title = content('.title').text();
                    item.description = content('div.text').append(content('div.fujian')).html();
                    item.author = content('meta[name="ContentSource"]').prop('content');
                    item.category = [
                        ...new Set([content('meta[name="ColumnName"]').prop('content'), content('meta[name="ColumnType"]').prop('content'), ...(content('meta[name="ColumnKeywords"]').prop('content').split(/,|;/) ?? [])]),
                    ].filter(Boolean);
                    item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);
                    item.enclosure_url = content('a.fujianClass').first().prop('href');

                    if (item.enclosure_url) {
                        item.enclosure_url = new URL(item.enclosure_url, rootUrl).href;
                        item.enclosure_type = `application/${item.enclosure_url.split(/\./).pop()}`;
                    }
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const image = new URL($('div.logo img').prop('src'), currentUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), currentUrl).href;

    return {
        item: items,
        title: $('title').text().replace(/----/, ' - '),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[ name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
}
