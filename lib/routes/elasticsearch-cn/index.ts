// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export default async (ctx) => {
    const params = ctx.req.param('params') ?? '';

    const rootUrl = 'https://elasticsearch.cn';
    const currentUrl = `${rootUrl}${params ? `/${params}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.aw-question-content')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h4 a');
            const pubDate = item.find('span.text-color-999').not('.pull-right').first().text().split('•').pop().trim();

            return {
                title: a.text(),
                link: a.attr('href'),
                author: item.find('.aw-user-name').text(),
                pubDate: timezone(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(pubDate) ? parseDate(pubDate) : parseRelativeDate(pubDate), +8),
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

                item.description = content('.markitup-box').first().html();

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
