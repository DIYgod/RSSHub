// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? 'shidai';

    const rootUrl = 'http://www.wyzxwk.com';
    const currentUrl = `${rootUrl}/Article/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.g-sd').remove();

    let items = $('h3 a')
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
                if (item.link.indexOf('wyzxwk.com') > 0) {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = load(detailResponse.data);

                        content('.zs-modal-body').prev().nextAll().remove();

                        const pubDate = detailResponse.data.match(/<span class="s-grey-3">(\d{4}-\d{2}-\d{2})<\/span>/);
                        if (pubDate) {
                            item.pubDate = parseDate(pubDate[1], 'YYYY-MM-DD');
                        }

                        item.description = content('article').html();
                    } catch {
                        item.description = '';
                    }
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('title').text().split(' - ')[0]} - 乌有之乡网刊`,
        link: currentUrl,
        item: items,
    });
};
