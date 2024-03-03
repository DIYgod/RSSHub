// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'xw';

    const rootUrl = 'http://bs.bnu.edu.cn';
    const currentUrl = `${rootUrl}/${category}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('a[title]')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                pubDate: parseDate(item.prev().text()),
                link: `${rootUrl}/${category}/${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.right-c-content-con').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.right-c-title').text()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    });
};
