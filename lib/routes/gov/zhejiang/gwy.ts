// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { category, column } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'http://gwy.zjks.gov.cn';
    const currentUrl = new URL(`zjgwy/website/${category ? 'queryMore' : 'init'}.htm`, rootUrl).href;
    const detailUrl = new URL('zjgwy/website/queryDetail.htm', rootUrl).href;

    const { data: response } = await got.post(currentUrl, {
        form: {
            dsdm: column,
            mkxh: category,
            oldornew: 'new',
        },
    });

    const $ = load(response);

    let items = $('a[onclick^="queryDetail"]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const matches = item.prop('onclick').match(/queryDetail\('?(\d+)'?, '?(\d+)'?\);/);

            return {
                title: item.text(),
                link: detailUrl,
                category: matches[1],
                guid: `zjks-${matches[1]}-${matches[2]}`,
                pubDate: parseDate(item.parent().next().text()),
                tzid: matches[2],
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const { data: detailResponse } = await got.post(detailUrl, {
                    form: {
                        mkxh: item.category,
                        oldornew: 'new',
                        dsdm: column,
                        tzid: item.tzid,
                    },
                });

                const content = load(detailResponse);

                item.description = content('div.ibox-content').last().html();
                item.category = [content('div.ibox-title').last().find('h5').first().text()];

                const files = content('a.ke-insertfile');

                if (files.length > 0) {
                    const file = files.first();
                    item.enclosure_url = file.prop('href');
                }

                delete item.tzid;

                return item;
            })
        )
    );

    const columnName = $('button.btn-success').last().text();
    const categoryName = $('table').parent().prev().find('h5').text();

    ctx.set('data', {
        item: items,
        title: `${$('title').text()} - ${columnName}${categoryName}`,
        link: currentUrl,
        description: $('div.title-font2').text(),
        subtitle: `${columnName}${categoryName}`,
        author: $('div.title-font').text(),
        allowEmpty: true,
    });
};
