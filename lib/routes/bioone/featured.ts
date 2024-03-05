// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://bioone.org';
    const response = await got(rootUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    let items = $('.items h4 a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.attr('href').split('?')[0];

            return {
                title: item.text(),
                link: link.includes('http') ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = load(detailResponse.data);

                item.description = content('#divARTICLECONTENTTop').html();
                item.doi = content('meta[name="dc.Identifier"]').attr('content');
                item.pubDate = parseDate(content('meta[name="dc.Date"]').attr('content'));

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Featured articles - BioOne',
        link: rootUrl,
        item: items,
    });
};
