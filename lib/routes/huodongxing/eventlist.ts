import path from 'node:path';

import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx: Context): Promise<Data> => {
    const { query = 'orderby=n' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl: string = 'https://www.huodongxing.com';
    const targetUrl: string = new URL(`eventlist${query ? `?${query}` : ''}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('div.search-tab-content-item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a.item-title').first();

            const title: string = $aEl.text();

            $('div.item-title-wrap').remove();

            const image: string | undefined = $el.find('img.item-logo').attr('src');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                description: $el.find('div.search-tab-content-item-right').html(),
            });
            const pubDateStr: string | undefined = $el.find('span.item-data-icon').parent().contents().first().text().split(/-/)?.[0];
            const linkUrl: string | undefined = $aEl.attr('href');
            const authorEls: Element[] = $el.find('p.user-name').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: $authorEl.parent().parent().attr('href'),
                    avatar: $authorEl.parent().find('img.user-logo').attr('src'),
                };
            });
            const upDatedStr: string | undefined = $el.find('.time').text() || pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
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

                const title: string = $$('div.hdx-details-title').text();
                const image: string | undefined = $$('div.details-banner-main img').attr('src');
                const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: ($$('div.hdx-details-times').html() ?? '') + ($$('div.hdx-details-address').html() ?? '') + ($$('div.hdx-details-price').html() ?? '') + ($$('script#tpContent').html() ?? ''),
                });
                const linkUrl: string | undefined = $$('.title').attr('href');
                const categories: string[] =
                    $$('meta[name="keywords"]')
                        .attr('content')
                        ?.split(',')
                        .map((c) => c.trim()) ?? [];
                const authorEls: Element[] = $$('div.hdx-org-header').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.find('div.org-title').text(),
                        url: $$authorEl.attr('data-url') ? new URL($$authorEl.attr('data-url') as string, baseUrl).href : undefined,
                        avatar: $$authorEl.find('img.org-userLogo').attr('src'),
                    };
                });

                const processedItem: DataItem = {
                    title,
                    description,
                    link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
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
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.head-logo').attr('src'),
        author: $('meta[name="author"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/eventlist/:query?',
    name: '活动列表',
    url: 'www.huodongxing.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/huodongxing/eventlist',
    parameters: {
        query: {
            description: '查询参数，默认为空，可在对应页 URL 中找到',
        },
    },
    description: `:::tip
订阅 [深圳创业活动](https://www.huodongxing.com/eventlist?orderby=o&d=t2&channel=行业&tag=创业&city=深圳)，其源网址为 \`https://www.huodongxing.com/eventlist?orderby=o&d=t2&channel=行业&tag=创业&city=深圳\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/huodongxing/eventlist/orderby=o&d=t2&channel=行业&tag=创业&city=深圳\`](https://rsshub.app/huodongxing/eventlist/orderby=o&d=t2&channel=行业&tag=创业&city=深圳)。
:::
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
            source: ['www.huodongxing.com/eventlist'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const queryParams: string | undefined = urlObj.search.slice(1);

                return `/eventlist${queryParams ? `/${queryParams}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
