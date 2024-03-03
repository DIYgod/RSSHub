// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    const rootUrl = 'https://www.ndrc.gov.cn';
    const currentUrl = new URL(`fggz${category ? `/${category.endsWith('/') ? category : `${category}/`}` : '/'}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.u-list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') || item.text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: parseDate(item.next().text(), 'YYYY/MM/DD'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('meta[name="ArticleTitle"]').prop('content');
                item.description = content('div.TRS_Editor').html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = [...new Set([content('meta[name="ColumnName"]').prop('content'), content('meta[name="ColumnType"]').prop('content'), ...(content('meta[name="Keywords"]').prop('content').split(/,|;/) ?? [])])].filter(
                    Boolean
                );
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

    const image = $('div.logo a img').prop('src');

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        subtitle: $('meta[name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    });
};
