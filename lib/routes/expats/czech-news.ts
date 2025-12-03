import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'daily-news' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.expats.cz';
    const targetUrl: string = new URL(`czech-news/${category}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('div.main h3 a')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const processedItem: DataItem = {
                title: $el.text(),
                link: new URL($el.attr('href') as string, baseUrl).href,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                $$('div.promo-widget, div.eas').remove();

                const title: string = $$('div.title h1').text();
                const description: string | undefined = $$('div#expats-article-content').html() ?? undefined;
                const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                const categories: string[] = [$$('meta[property="article:section"]').attr('content') ?? ''];
                const authorEls: Element[] = $$('span.written-by a').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.text(),
                        url: $$authorEl.attr('href') ? new URL($$authorEl.attr('href') as string, baseUrl).href : undefined,
                        avatar: $$('div.authors div.photos a img').attr('src') ? new URL($$('div.authors div.photos a img').attr('src') as string, baseUrl).href : undefined,
                    };
                });
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/czech-news/:category?',
    name: 'Czech News',
    url: 'www.expats.cz',
    maintainers: ['nczitzk'],
    handler,
    example: '/expats/czech-news/daily-news',
    parameters: {
        category: {
            description: 'Category, `daily-news` by default',
            options: [
                {
                    label: 'Daily News',
                    value: 'daily-news',
                },
                {
                    label: 'Prague Guide',
                    value: 'prague-guide',
                },
                {
                    label: 'Culture & Events',
                    value: 'culture-events',
                },
                {
                    label: 'Food & Drink',
                    value: 'food-drink',
                },
                {
                    label: 'Expat Life',
                    value: 'expat-life',
                },
                {
                    label: 'Housing',
                    value: 'housing',
                },
                {
                    label: 'Education',
                    value: 'education',
                },
                {
                    label: 'Health',
                    value: 'health',
                },
                {
                    label: 'Work',
                    value: 'work',
                },
                {
                    label: 'Travel',
                    value: 'travel',
                },
                {
                    label: 'Economy',
                    value: 'economy',
                },
                {
                    label: 'Language',
                    value: 'language',
                },
            ],
        },
    },
    description: `::: tip
To subscribe to [Daily News](https://www.expats.cz/czech-news/daily-news), where the source URL is \`https://www.expats.cz/czech-news/daily-news\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/expats/czech-news/daily-news\`](https://rsshub.app/expats/czech-news/daily-news).
:::

<details>
  <summary>More categories</summary>

| Category                                                      | ID                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Daily News](https://www.expats.cz/czech-news/daily-news)     | [daily-news](https://rsshub.app/expats/czech-news/daily-news)         |
| [Prague Guide](https://www.expats.cz/czech-news/prague-guide) | [prague-guide](https://rsshub.app/expats/czech-news/prague-guide)     |
| [Culture](https://www.expats.cz/czech-news/culture-events)    | [culture-events](https://rsshub.app/expats/czech-news/culture-events) |
| [Food & Drink](https://www.expats.cz/czech-news/food-drink)   | [food-drink](https://rsshub.app/expats/czech-news/food)               |
| [Expat Life](https://www.expats.cz/czech-news/expat-life)     | [expat-life](https://rsshub.app/expats/czech-news/expat-life)         |
| [Housing](https://www.expats.cz/czech-news/housing)           | [housing](https://rsshub.app/expats/czech-news/housing)               |
| [Education](https://www.expats.cz/czech-news/education)       | [education](https://rsshub.app/expats/czech-news/education)           |
| [Health](https://www.expats.cz/czech-news/health)             | [health](https://rsshub.app/expats/czech-news/health)                 |
| [Work](https://www.expats.cz/czech-news/work)                 | [work](https://rsshub.app/expats/czech-news/work)                     |
| [Travel](https://www.expats.cz/czech-news/travel)             | [travel](https://rsshub.app/expats/czech-news/travel)                 |
| [Economy](https://www.expats.cz/czech-news/economy)           | [economy](https://rsshub.app/expats/czech-news/economy)               |
| [Language](https://www.expats.cz/czech-news/language)         | [language](https://rsshub.app/expats/czech-news/language)             |

</details>
`,
    categories: ['new-media'],
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
            source: ['www.expats.cz/czech-news/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/expats/czech-news${category ? `/${category}` : ''}`;
            },
        },
        {
            title: 'Daily News',
            source: ['www.expats.cz/czech-news/daily-news'],
            target: '/expats/czech-news/daily-news',
        },
        {
            title: 'Prague Guide',
            source: ['www.expats.cz/czech-news/prague-guide'],
            target: '/expats/czech-news/prague-guide',
        },
        {
            title: 'Culture & Events',
            source: ['www.expats.cz/czech-news/culture-events'],
            target: '/expats/czech-news/culture-events',
        },
        {
            title: 'Food & Drink',
            source: ['www.expats.cz/czech-news/food-drink'],
            target: '/expats/czech-news/food-drink',
        },
        {
            title: 'Expat Life',
            source: ['www.expats.cz/czech-news/expat-life'],
            target: '/expats/czech-news/expat-life',
        },
        {
            title: 'Housing',
            source: ['www.expats.cz/czech-news/housing'],
            target: '/expats/czech-news/housing',
        },
        {
            title: 'Education',
            source: ['www.expats.cz/czech-news/education'],
            target: '/expats/czech-news/education',
        },
        {
            title: 'Health',
            source: ['www.expats.cz/czech-news/health'],
            target: '/expats/czech-news/health',
        },
        {
            title: 'Work',
            source: ['www.expats.cz/czech-news/work'],
            target: '/expats/czech-news/work',
        },
        {
            title: 'Travel',
            source: ['www.expats.cz/czech-news/travel'],
            target: '/expats/czech-news/travel',
        },
        {
            title: 'Economy',
            source: ['www.expats.cz/czech-news/economy'],
            target: '/expats/czech-news/economy',
        },
        {
            title: 'Language',
            source: ['www.expats.cz/czech-news/language'],
            target: '/expats/czech-news/language',
        },
    ],
    view: ViewType.Articles,
};
