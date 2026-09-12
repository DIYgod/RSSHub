import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/headline/:country?',
    categories: ['new-media'],
    example: '/fashionnetwork/headline',
    parameters: { country: 'Country, see the News route below, `ww` by default' },
    name: 'Headline',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { country = 'ww' } = ctx.req.param();
    if (!isValidHost(country)) {
        throw new InvalidParameterError('Invalid country');
    }

    const rootUrl = `https://${country}.fashionnetwork.com`;
    const response = await ofetch(rootUrl);

    const $ = load(response);

    const list = $('.point-carousel__item')
        .slice(5, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.family-title a');

            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                pubDate: parseDate($item.find('.time-ago').attr('data-value')!),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                content('.newsTitle, .ads').remove();

                return {
                    ...item,
                    description: content('div[itemprop="text"]').html(),
                };
            })
        )
    );

    return {
        title: `${$('.category-label').eq(0).text()} - FashionNetwork`,
        link: rootUrl,
        item: items,
    };
}
