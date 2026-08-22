import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/news/:sectors?/:categories?/:country?',
    categories: ['new-media'],
    example: '/fashionnetwork/news/5,6/15,112',
    parameters: {
        sectors: 'Sectors, see below, `all` by default',
        categories: 'Categories, see below, `all` by default',
        country: 'Country, see below, `ww` as Worldwide by default',
    },
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    description: `Sectors

Fashion 1

| Ready-to-wear | Accessories | Footwear | Sports | Denim | Lingerie | Swimwear | Eyewear | Bridal wear | Textile | Miscellaneous |
| ------------- | ----------- | -------- | ------ | ----- | -------- | -------- | ------- | ----------- | ------- | ------------- |
| 5             | 6           | 7        | 8      | 9     | 10       | 11       | 12      | 13          | 14      | 31            |

Luxury 2

| Ready-to-wear | Accessories | Footwear | Watches | Jewellery | Miscellaneous |
| ------------- | ----------- | -------- | ------- | --------- | ------------- |
| 15            | 16          | 17       | 18      | 19        | 32            |

Beauty 3

| Perfume | Cosmetics | Aesthetics | Wellness | Hair | Miscellaneous |
| ------- | --------- | ---------- | -------- | ---- | ------------- |
| 21      | 22        | 23         | 24       | 33   |               |

Lifestyle 4

| Home decor | Tableware | Hospitality | Fine foods | Tourism | Miscellaneous |
| ---------- | --------- | ----------- | ---------- | ------- | ------------- |
| 25         | 26        | 27          | 28         | 29      | 34            |

Others 30

Category

| Retail | Business | Industry | Trade shows |
| ------ | -------- | -------- | ----------- |
| 15     | 112      | 5        | 12          |

| Innovations | Collection | Catwalks | Design |
| ----------- | ---------- | -------- | ------ |
| 113         | 114        | 60       | 70     |

| Media | Campaigns | People | Events | Appointments |
| ----- | --------- | ------ | ------ | ------------ |
| 50    | 115       | 80     | 90     | 95           |

Country

| Latin America | Brazil | China | France |
| ------------- | ------ | ----- | ------ |
| pe            | br     | cn    | fr     |

| Germany | India | Italy | Japan |
| ------- | ----- | ----- | ----- |
| de      | in    | it    | jp    |

| Mexico | Portugal | Russia | Spain |
| ------ | -------- | ------ | ----- |
| mx     | pt       | ru     | es    |

| Turkey | United Kingdom | USA | Worldwide |
| ------ | -------------- | --- | --------- |
| tr     | uk             | us  | ww        |`,
};

async function handler(ctx: Context) {
    const { country = 'ww' } = ctx.req.param();
    let { sectors = '', categories = '' } = ctx.req.param();

    sectors = sectors === 'all' ? '' : sectors;
    categories = categories === 'all' ? '' : categories;

    const sectorsUrl = sectors ? 'sectors%5B%5D=' + sectors.split(',').join('&sectors%5B%5D=') : '';
    const categoriesUrl = categories ? 'categs%5B%5D=' + categories.split(',').join('&categs%5B%5D=') : '';

    if (!isValidHost(country)) {
        throw new InvalidParameterError('Invalid country');
    }

    const rootUrl = `https://${country}.fashionnetwork.com`;
    const currentUrl = `${rootUrl}/news/s.jsonp?${sectorsUrl}&${categoriesUrl}`;
    const response = await ofetch(currentUrl, { responseType: 'text' });

    const $ = load(
        response
            .match(/"html":"(.*)","relatedUrl"/)![1]
            .replaceAll(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
            .replaceAll(String.raw`\n`, '')
            .replaceAll(String.raw`\/`, '/')
    );

    const list = $('.list-ui__title')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href')!,
                pubDate: parseDate($item.parent().find('time').attr('datetime')!),
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

    const labels = $('.filter__label')
        .toArray()
        .map((item) => $(item).text());

    return {
        title: `${labels.join(',') || 'All'} - FashionNetwork`,
        link: `${rootUrl}/news/s?${sectorsUrl}&${categoriesUrl}`,
        item: items,
    };
}
