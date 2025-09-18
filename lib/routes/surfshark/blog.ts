import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const domain: string = 'surfshark.com';
    const baseUrl: string = `https://${domain}`;
    const targetUrl: string = new URL(`blog${category ? `/${category}` : ''}`, baseUrl).href;

    const headers = {
        host: 'surfshark.com',
        origin: baseUrl,
        referer: targetUrl,
    };

    const response = await ofetch(targetUrl, {
        headers,
    });
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('div.dg-article-single-card')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('div.dg-article-content__info a[title]');

            const title: string = $aEl.text();
            const image: string | undefined = $el.find('a.dg-article-image img').attr('src');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
            });

            const pubDateEl: Cheerio<Element> = $el.find('span.js-date');
            const pubDateStr: string | undefined = `${pubDateEl.attr('data-year')}-${pubDateEl.attr('data-month')}-${pubDateEl.attr('data-day')}`;

            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('div.dg-blog-breadcrumbs a').toArray();
            const categories: string[] = [
                ...new Set(
                    categoryEls
                        .map((el) => $(el).text())
                        .slice(1)
                        .filter(Boolean)
                ),
            ];
            const authorEls: Element[] = $el.find('a.author-link ').toArray();
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
                description,
                pubDate: parseDate(pubDateStr),
                link: linkUrl,
                category: categories,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: parseDate(upDatedStr),
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
                const detailResponse = await ofetch(item.link, {
                    headers,
                });
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('meta[property="og:title"]').attr('content') ?? item.title;
                const image: string | undefined = $$('div.dg-featured-img-container img').attr('src');
                const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: $$('div.dg-blog-post-blocks').html(),
                });
                const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                const authorEls: Element[] = $$('div.dg-blog-post-author-top').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.find('a.author-link').last().text(),
                        url: $$authorEl.find('a.author-link').last().attr('href'),
                        avatar: $$authorEl.find('a.author-avatar img').attr('src'),
                    };
                });
                const upDatedStr: string | undefined = $$('meta[property="article:modified_time"]').attr('content');

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
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
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/blog/:category{.+}?',
    name: 'Blog',
    url: 'surfshark.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/surfshark/blog',
    parameters: {
        category: {
            description: 'Category, All by default',
            options: [
                {
                    label: 'All',
                    value: '',
                },
                {
                    label: 'Cybersecurity',
                    value: 'cybersecurity',
                },
                {
                    label: 'All things VPN',
                    value: 'all-things-vpn',
                },
                {
                    label: 'Internet censorship',
                    value: 'internet-censorship',
                },
                {
                    label: 'Entertainment',
                    value: 'entertainment',
                },
                {
                    label: 'Expert Insights',
                    value: 'expert-insights',
                },
                {
                    label: 'Video',
                    value: 'video',
                },
                {
                    label: 'News',
                    value: 'news',
                },
            ],
        },
    },
    description: `:::tip
To subscribe to [Cybersecurity](https://surfshark.com/blog/cybersecurity), where the source URL is \`https://surfshark.com/blog/cybersecurity\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/surfshark/blog/cybersecurity\`](https://rsshub.app/surfshark/blog/cybersecurity).
:::

<details>
  <summary>More categories</summary>

| Category                                                              | ID                                                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [All](https://surfshark.com/blog)                                     | (empty)                                                                      |
| [Cybersecurity](https://surfshark.com/blog/cybersecurity)             | [cybersecurity](https://rsshub.app/surfshark/blog/cybersecurity)             |
| [All things VPN](https://surfshark.com/blog/all-things-vpn)           | [all-things-vpn](https://rsshub.app/surfshark/blog/all-things-vpn)           |
| [Internet censorship](https://surfshark.com/blog/internet-censorship) | [internet-censorship](https://rsshub.app/surfshark/blog/internet-censorship) |
| [Entertainment](https://surfshark.com/blog/entertainment)             | [entertainment](https://rsshub.app/surfshark/blog/entertainment)             |
| [Expert Insights](https://surfshark.com/blog/expert-insights)         | [expert-insights](https://rsshub.app/surfshark/blog/expert-insights)         |
| [Video](https://surfshark.com/blog/video)                             | [video](https://rsshub.app/surfshark/blog/video)                             |
| [News](https://surfshark.com/blog/news)                               | [news](https://rsshub.app/surfshark/blog/news)                               |

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
            source: ['surfshark.com/blog/:category'],
            target: '/blog/:category',
        },
        {
            title: 'All',
            source: ['surfshark.com/blog'],
            target: '/blog',
        },
        {
            title: 'Cybersecurity',
            source: ['surfshark.com/blog/cybersecurity'],
            target: '/blog/cybersecurity',
        },
        {
            title: 'All things VPN',
            source: ['surfshark.com/blog/all-things-vpn'],
            target: '/blog/all-things-vpn',
        },
        {
            title: 'Internet censorship',
            source: ['surfshark.com/blog/internet-censorship'],
            target: '/blog/internet-censorship',
        },
        {
            title: 'Entertainment',
            source: ['surfshark.com/blog/entertainment'],
            target: '/blog/entertainment',
        },
        {
            title: 'Expert Insights',
            source: ['surfshark.com/blog/expert-insights'],
            target: '/blog/expert-insights',
        },
        {
            title: 'Video',
            source: ['surfshark.com/blog/video'],
            target: '/blog/video',
        },
        {
            title: 'News',
            source: ['surfshark.com/blog/news'],
            target: '/blog/news',
        },
    ],
    view: ViewType.Articles,
};
