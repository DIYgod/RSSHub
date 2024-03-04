// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? 'yw';

    const rootUrl = 'https://www.stcn.com';
    const currentUrl = `${rootUrl}/article/list/${id}.html`;
    const apiUrl = `${rootUrl}/article/list.html?type=${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = load(response.data);

    let items = $('.t, .tt, .title')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text().replaceAll(/(^【|】$)/g, ''),
                link: link.startsWith('http') ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/\.html$/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('.detail-title').text();
                    item.author = content('.detail-info span').first().text().split('：').pop();
                    item.pubDate = timezone(parseDate(content('.detail-info span').last().text()), +8);
                    item.category = content('.detail-content-tags div')
                        .toArray()
                        .map((t) => content(t).text());
                    item.description = content('.detail-content').html();
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `证券时报网 - ${$('.breadcrumb a').last().text()}`,
        link: currentUrl,
        item: items,
    });
};
