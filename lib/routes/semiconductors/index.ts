import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'news-events/latest-news' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '12', 10);

    const baseUrl: string = 'https://www.semiconductors.org';
    const targetUrl: string = new URL(category.endsWith('/') ? category : `${category}/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('div.col-sm-8')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a').first();

            const title: string = $aEl.text();
            const image: string | undefined = $el
                .prev()
                .find('img')
                .attr('src')
                ?.replace(/-\d+x\d+\./, '.');
            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $aEl.next().text(),
            });
            const pubDateStr: string | undefined = $el.find('div.resource-item-meta').text().split(/:\s+/).pop();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('div.resource-item-category span.ric').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr, 'DD/MM/YY') : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr, 'DD/MM/YY') : undefined,
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

                const title: string = $$('h1').text();

                $$('h1').remove();
                $$('main#main').contents().first().remove();
                $$('main#main p').first().remove();
                $$('div.newshr').remove();

                const image: string | undefined = $$('meta[property="og:image"]')
                    .attr('content')
                    ?.replace(/-scaled\./, '.');
                const description: string | undefined = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: $$('main#main').html() || undefined,
                });
                const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                const authorEls: Element[] = $$('meta[name="author"]').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.attr('content'),
                        url: undefined,
                        avatar: undefined,
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
    path: '/:category{.+}?',
    name: 'Latest News',
    url: 'www.semiconductors.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/semiconductors/news-events/latest-news',
    parameters: {
        category: {
            description: 'Category, `news-events/latest-news` by default',
        },
    },
    description: `:::tip
To subscribe to [Latest News](https://www.semiconductors.org/news-events/latest-news/), where the source URL is \`https://www.semiconductors.org/news-events/latest-news/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/semiconductors/news-events/latest-news\`](https://rsshub.app/semiconductors/news-events/latest-news).
:::`,
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
            source: ['www.semiconductors.org/:category'],
            target: '/:category',
        },
    ],
    view: ViewType.Articles,
};
