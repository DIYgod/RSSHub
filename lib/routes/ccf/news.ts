// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') || 'Media_list';

    const rootUrl = 'https://www.ccf.org.cn';
    const currentUrl = `${rootUrl}/${category}/`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.tit a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                content('.new_info .num').remove();

                item.description = content('.txt').html();
                item.pubDate = parseDate(content('.new_info span').text());

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
