// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? 'all';
    const page = ctx.req.param('page') ?? '0';

    const rootUrl = 'https://sakurazaka46.com';
    const params = id === 'all' ? `?page=${page}` : `?page=${page}&ct=${id}`;
    const currentUrl = `${rootUrl}/s/s46/diary/blog/list${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.com-blog-part .box a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                author: item.find('.name').text(),
                link: `${rootUrl}${item.attr('href').split('?')[0]}`,
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

                item.description = content('.box-article').html();
                item.pubDate = timezone(parseDate(content('.blog-foot .date').text()), +9);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('title').text()}${id ? ` - ${$('.name').first().text()}` : ''}`,
        link: currentUrl,
        item: items,
    });
};
