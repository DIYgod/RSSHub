import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { baseUrl, fetchItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'highlights', country = 'us' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const targetUrl: string = new URL(category.endsWith('/') ? category : `${category}/`, baseUrl).href;

    const response = await ofetch(targetUrl, {
        headers: {
            Cookie: `countryId=${country};`,
        },
    });
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';
    const selector: string = 'div.card-panel';

    const items: DataItem[] = await fetchItems($, selector, targetUrl, country, limit);

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.brand-logo img').attr('src') ? new URL($('a.brand-logo img').attr('src') as string, baseUrl).href : undefined,
        author: title.split(/\|/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category?/:country?',
    name: 'Category',
    url: 'app-sales.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/app-sales/highlights',
    parameters: {
        category: {
            description: 'Category, `highlights` as Highlights by default',
            options: [
                {
                    label: 'Highlights',
                    value: 'highlights',
                },
                {
                    label: 'Active Sales',
                    value: 'activesales',
                },
                {
                    label: 'Now Free',
                    value: 'nowfree',
                },
            ],
        },
        country: {
            description: 'Country ID, `us` as United States by default',
            options: [
                {
                    label: 'United States',
                    value: 'us',
                },
                {
                    label: 'Austria',
                    value: 'at',
                },
                {
                    label: 'Australia',
                    value: 'au',
                },
                {
                    label: 'Brazil',
                    value: 'br',
                },
                {
                    label: 'Canada',
                    value: 'ca',
                },
                {
                    label: 'France',
                    value: 'fr',
                },
                {
                    label: 'Germany',
                    value: 'de',
                },
                {
                    label: 'India',
                    value: 'in',
                },
                {
                    label: 'Italy',
                    value: 'it',
                },
                {
                    label: 'Netherlands',
                    value: 'nl',
                },
                {
                    label: 'Poland',
                    value: 'pl',
                },
                {
                    label: 'Russia',
                    value: 'ru',
                },
                {
                    label: 'Spain',
                    value: 'es',
                },
                {
                    label: 'Sweden',
                    value: 'se',
                },
                {
                    label: 'Great Britain',
                    value: 'gb',
                },
            ],
        },
    },
    description: `::: tip
To subscribe to [Highlights](https://www.app-sales.net/highlights/), where the source URL is \`https://www.app-sales.net/highlights/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/app-sales/highlights\`](https://rsshub.app/app-sales/highlights).
:::

| Highlights | Active Sales | Now Free |
| ---------- | ------------ | -------- |
| highlights | activesales  | nowfree  |

<details>
  <summary>More countries</summary>

| Currency | Country       | ID  |
| -------- | ------------- | --- |
| USD      | United States | us  |
| EUR      | Austria       | at  |
| AUD      | Australia     | au  |
| BRL      | Brazil        | br  |
| CAD      | Canada        | ca  |
| EUR      | France        | fr  |
| EUR      | Germany       | de  |
| INR      | India         | in  |
| EUR      | Italy         | it  |
| EUR      | Netherlands   | nl  |
| PLN      | Poland        | pl  |
| RUB      | Russia        | ru  |
| EUR      | Spain         | es  |
| SEK      | Sweden        | se  |
| GBP      | Great Britain | gb  |

</details>
`,
    categories: ['program-update'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['app-sales.net/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/app-sales${category ? `/${category}` : ''}`;
            },
        },
        {
            title: 'Highlights',
            source: ['app-sales.net/highlights'],
            target: '/highlights',
        },
        {
            title: 'Active Sales',
            source: ['app-sales.net/activesales'],
            target: '/activesales',
        },
        {
            title: 'Now Free',
            source: ['app-sales.net/nowfree'],
            target: '/nowfree',
        },
    ],
    view: ViewType.Articles,
};
