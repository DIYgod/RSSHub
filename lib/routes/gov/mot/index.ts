import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/mot/:category{.+}?',
    name: '中华人民共和国交通运输部',
    maintainers: ['ladeng07'],
    handler,
};

async function handler(ctx) {
    const { category = 'tongjishuju/gonglu' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.mot.gov.cn';
    const currentUrl = new URL(`${category}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.tab-pane a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.prop('title'),
                link: link.startsWith('http') ? link : new URL(item.prop('href'), currentUrl).href,
                pubDate: parseDate(item.find('span.badge').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/\.gov\.cn/.test(item.link) && item.link.endsWith('.html')) {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    item.title = content('meta[name="ArticleTitle"]').prop('content') || content('h1#ti').text();
                    item.description = content('div.TRS_UEDITOR').html();
                    item.author = [...new Set([content('meta[name="Author"]').prop('content'), content('meta[name="ContentSource"]').prop('content')])].find(Boolean);
                    item.category = [
                        ...new Set([content('meta[name="ColumnName"]').prop('content'), content('meta[name="ColumnType"]').prop('content'), ...(content('meta[name="Keywords"]').prop('content')?.split(/,|;/) ?? [])]),
                    ].filter(Boolean);
                    item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);
                }

                return item;
            })
        )
    );

    const image = new URL($('a.navbar-brand img').prop('src'), rootUrl).href;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        subtitle: $('meta[name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
}
