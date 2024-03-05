// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://news.futunn.com';
    const currentUrl = `${rootUrl}/main`;
    const apiUrl = `${rootUrl}/news-site-api/main/get-market-list?size=${limit}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.list.map((item) => ({
        title: item.title,
        link: item.url.split('?')[0],
        author: item.source,
        pubDate: parseDate(item.timestamp * 1000),
        description: art(path.join(__dirname, 'templates/description.art'), {
            abs: item.abs,
            pic: item.pic,
        }),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/news\.futunn\.com/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    content('.futu-news-time-stamp').remove();
                    content('.nnstock').each(function () {
                        content(this).replaceWith(`<a href="${content(this).attr('href')}">${content(this).text().replaceAll('$', '')}</a>`);
                    });

                    item.description = content('.origin_content').html();
                    item.category = [
                        ...content('.news__from-topic__title')
                            .toArray()
                            .map((a) => content(a).text()),
                        ...content('#relatedStockWeb .stock-name')
                            .toArray()
                            .map((s) => content(s).text().trim()),
                    ];
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Futubull - Headlines',
        link: currentUrl,
        item: items,
    });
};
