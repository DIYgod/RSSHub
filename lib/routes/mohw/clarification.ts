// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www.mohw.gov.tw';
    const currentUrl = `${rootUrl}/lp-17-1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.list01 a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.description = content('article').html();
                item.pubDate = parseDate(content('meta[name="DC.Date"]').attr('datetime'));

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '即時新聞澄清 - 台灣衛生福利部',
        link: currentUrl,
        item: items,
    });
};
