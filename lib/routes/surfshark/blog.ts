import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import { type Data, type DataItem, type Language, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 30;

    const domain = 'surfshark.com';
    const baseUrl = `https://${domain}`;
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
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('div.dg-article-single-card')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('div.dg-article-content__info a[title]');

            const title: string = $aEl.text();
            const image: string | undefined = $el.find('a.dg-article-image img').attr('src');
            const description: string | undefined = renderDescription({
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
            const dateParts = ['data-year', 'data-month', 'data-day'].map((attribute) => pubDateEl.attr(attribute));
            const pubDateStr = dateParts.every(Boolean) ? dateParts.join('-') : undefined;

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
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                category: categories,
                author: authors,
                content: {
                    html: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        async (item) => {
            if (!item.link) {
                return item;
            }

            const resolvedValue1 = await cache.tryGet(`surfshark:article:v2:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!, {
                    headers,
                });
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('meta[property="og:title"]').attr('content') ?? item.title;
                const image: string | undefined = $$('div.dg-featured-img-container img').attr('src');
                const description: string | undefined = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: $$('div.dg-blog-post-blocks').html() ?? undefined,
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

                return {
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                    author: authors,
                    content: { html: description },
                    image,
                    banner: image,
                    updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                };
            });
            {
                const detail = resolvedValue1;
                return {
                    ...item,
                    ...detail,
                    pubDate: detail.pubDate ?? item.pubDate,
                    updated: detail.updated ?? item.updated,
                };
            }
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
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
    description: `::: tip
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

</details>`,
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
    ],
    view: ViewType.Articles,
};
