import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://bullionvault.com';
    const targetUrl: string = new URL(`gold-news${category ? `/${category}` : ''}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('section#block-views-latest-articles-block div.media, section#block-system-main table.views-table tr')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('td.views-field-title a, div.views-field-title a').first();

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('td.views-field-created, div.views-field-created').text().trim();
            const linkUrl: string | undefined = $aEl.attr('href');
            const authorEls: Element[] = $el.find('a.username').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: $authorEl.attr('href'),
                    avatar: undefined,
                };
            });
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                author: authors,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('header h1').text();
                    const description: string | undefined = $$('div[property="content:encoded"]').html() ?? '';
                    const pubDateStr: string | undefined = $$('div.submitted').text().split(/,/).pop();
                    const categories: string[] = $$('meta[name="news_keywords"]').attr('content')?.split(/,/) ?? [];
                    const authorEls: Element[] = $$('div.view-author-bio').toArray();
                    const authors: DataItem['author'] = authorEls.map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl);

                        return {
                            name: $$authorEl.find('h1').text(),
                            url: undefined,
                            avatar: $$authorEl.find('img').attr('src'),
                        };
                    });
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
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:title"]').attr('content')?.split(/\|/).pop(),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/gold-news/:category?',
    name: 'Gold News',
    url: 'bullionvault.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/bullionvault/gold-news',
    parameters: {
        category: {
            description: 'Category',
            options: [
                {
                    label: 'Gold market analysis & gold investment research',
                    value: '',
                },
                {
                    label: 'Opinion & Analysis',
                    value: 'opinion-analysis',
                },
                {
                    label: 'Gold Price News',
                    value: 'gold-price-news',
                },
                {
                    label: 'Investment News',
                    value: 'news',
                },
                {
                    label: 'Gold Investor Index',
                    value: 'gold-investor-index',
                },
                {
                    label: 'Gold Infographics',
                    value: 'infographics',
                },
                {
                    label: 'Market Fundamentals',
                    value: 'market-fundamentals',
                },
            ],
        },
    },
    description: `:::tip
If you subscribe to [Gold Price News](https://www.bullionvault.com/gold-news/gold-price-news)，where the URL is \`https://www.bullionvault.com/gold-news/gold-price-news\`, extract the part \`https://www.bullionvault.com/gold-news/\` to the end, and use it as the parameter to fill in. Therefore, the route will be [\`/bullionvault/gold-news/gold-price-news\`](https://rsshub.app/bullionvault/gold-news/gold-price-news).
:::

| Category                                                                          | ID                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Opinion & Analysis](https://www.bullionvault.com/gold-news/opinion-analysis)     | [opinion-analysis](https://rsshub.app/bullionvault/gold-news/opinion-analysis)       |
| [Gold Price News](https://www.bullionvault.com/gold-news/gold-price-news)         | [gold-price-news](https://rsshub.app/bullionvault/gold-news/gold-price-news)         |
| [Investment News](https://www.bullionvault.com/gold-news/news)                    | [news](https://rsshub.app/bullionvault/gold-news/news)                               |
| [Gold Investor Index](https://www.bullionvault.com/gold-news/gold-investor-index) | [gold-investor-index](https://rsshub.app/bullionvault/gold-news/gold-investor-index) |
| [Gold Infographics](https://www.bullionvault.com/gold-news/infographics)          | [infographics](https://rsshub.app/bullionvault/gold-news/infographics)               |
| [Market Fundamentals](https://www.bullionvault.com/gold-news/market-fundamentals) | [market-fundamentals](https://rsshub.app/bullionvault/gold-news/market-fundamentals) |
`,
    categories: ['finance'],
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
            source: ['bullionvault.com/gold-news/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/bullionvault/gold-news${category ? `/${category}` : ''}`;
            },
        },
        {
            title: 'Gold market analysis & gold investment research',
            source: ['bullionvault.com/gold-news'],
            target: '/gold-news',
        },
        {
            title: 'Opinion & Analysis',
            source: ['bullionvault.com/gold-news/opinion-analysis'],
            target: '/gold-news/opinion-analysis',
        },
        {
            title: 'Gold Price News',
            source: ['bullionvault.com/gold-news/gold-price-news'],
            target: '/gold-news/gold-price-news',
        },
        {
            title: 'Investment News',
            source: ['bullionvault.com/gold-news/news'],
            target: '/gold-news/news',
        },
        {
            title: 'Gold Investor Index',
            source: ['bullionvault.com/gold-news/gold-investor-index'],
            target: '/gold-news/gold-investor-index',
        },
        {
            title: 'Gold Infographics',
            source: ['bullionvault.com/gold-news/infographics'],
            target: '/gold-news/infographics',
        },
        {
            title: 'Market Fundamentals',
            source: ['bullionvault.com/gold-news/market-fundamentals'],
            target: '/gold-news/market-fundamentals',
        },
    ],
    view: ViewType.Articles,
};
