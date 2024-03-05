// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const path = getSubPath(ctx) === '/sohac' ? '/index/tzgg' : getSubPath(ctx).replace(/^\/sohac/, '');

    const rootUrl = 'https://sohac.nenu.edu.cn';
    const currentUrl = `${rootUrl}${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('span.data')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item).prev();

            return {
                title: item.text(),
                link: new URL(item.attr('href'), rootUrl).href,
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

                item.title = content('.biaoti').text();
                item.description = content('.v_news_content').html();
                item.pubDate = parseDate(
                    content('.sj')
                        .text()
                        .match(/(\d{4}-\d{2}-\d{2})/)[1]
                );

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
